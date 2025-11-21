import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";

export class RAGService {
    constructor() {
        this.embeddings = new OpenAIEmbeddings();
        this.llm = new ChatOpenAI({ modelName: "gpt-4o-mini" });
        this.vectorStore = null;
    }

    async getVectorStore() {
        if (!this.vectorStore) {
            this.vectorStore = await QdrantVectorStore.fromExistingCollection(
                this.embeddings,
                {
                    url: process.env.QDRANT_URL || "http://localhost:6333",
                    apiKey: process.env.QDRANT_API_KEY,
                    collectionName: "rag_collection",
                }
            ).catch(() => null);

            if (!this.vectorStore) {
                // Create collection if it doesn't exist (implicitly handled by QdrantVectorStore.fromTexts/fromDocuments usually, but here we might need to initialize)
                // For simplicity in this demo, we'll rely on the ingestion to create it or just use the first ingestion to set it up.
                // Actually, let's just return a new instance pointing to the URL.
                this.vectorStore = new QdrantVectorStore(this.embeddings, {
                    url: process.env.QDRANT_URL || "http://localhost:6333",
                    apiKey: process.env.QDRANT_API_KEY,
                    collectionName: "rag_collection",
                });
            }
        }
        return this.vectorStore;
    }

    async processDocuments(docs, userId, sourceMetadata = {}) {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs = await splitter.splitDocuments(docs);

        // Add metadata with source-specific information and prepend source header
        const sourceHeader = sourceMetadata.sourceDescription
            ? `[SOURCE: ${sourceMetadata.sourceDescription}]\n\n`
            : '';

        const docsWithMetadata = splitDocs.map(doc => {
            // Prepend source header to content
            doc.pageContent = sourceHeader + doc.pageContent;

            doc.metadata = {
                ...doc.metadata,
                userId,
                ...sourceMetadata,
            };
            return doc;
        });

        console.log(`Split into ${docsWithMetadata.length} chunks with metadata:`, sourceMetadata);

        const vectorStore = await this.getVectorStore();
        await vectorStore.addDocuments(docsWithMetadata);

        return docsWithMetadata.length;
    }

    async ingestPDF(filePath, userId) {
        console.log(`Ingesting PDF: ${filePath} for user ${userId}`);
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        console.log(`Loaded ${docs.length} pages.`);

        const filename = filePath.split('/').pop();
        const sourceMetadata = {
            sourceType: 'pdf',
            sourceId: `pdf-${Date.now()}`,
            filename: filename,
            ingestedAt: new Date().toISOString(),
            sourceDescription: `PDF file: "${filename}"`,
        };

        const chunks = await this.processDocuments(docs, userId, sourceMetadata);
        return { success: true, pages: docs.length, chunks };
    }

    async ingestWeb(url, userId) {
        console.log(`Ingesting Web: ${url} for user ${userId}`);

        // First, fetch the raw HTML
        const response = await fetch(url);
        const html = await response.text();

        // Use Cheerio to parse HTML and extract links
        const cheerio = await import('cheerio');
        const $ = cheerio.load(html);

        // Extract all links
        const links = [];
        $('a[href]').each((i, elem) => {
            const href = $(elem).attr('href');
            const text = $(elem).text().trim();

            // Filter out empty, anchor-only, and javascript links
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                // Convert relative URLs to absolute
                let absoluteUrl = href;
                if (href.startsWith('/')) {
                    const urlObj = new URL(url);
                    absoluteUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
                } else if (!href.startsWith('http')) {
                    absoluteUrl = new URL(href, url).href;
                }

                links.push({
                    text: text || absoluteUrl,
                    url: absoluteUrl
                });
            }
        });

        // Now load the document using CheerioWebBaseLoader for text content
        const loader = new CheerioWebBaseLoader(url);
        const docs = await loader.load();
        console.log(`Loaded web page with ${links.length} links.`);

        // Extract title from the loaded document if available
        const title = docs[0]?.metadata?.title || $('title').text() || url;

        // Append links to content if found
        if (links.length > 0) {
            const linkSection = '\n\n=== LINKS FOUND ON THIS PAGE ===\n' +
                links.map(l => `- ${l.text}: ${l.url}`).join('\n');
            docs[0].pageContent += linkSection;
            console.log('Sample links extracted:', links.slice(0, 5));
        }

        const sourceMetadata = {
            sourceType: 'website',
            sourceId: `web-${Date.now()}`,
            sourceUrl: url,
            title: title,
            ingestedAt: new Date().toISOString(),
            sourceDescription: `Website: "${title}" (${url})`,
            linksCount: links.length,
        };

        console.log(`Extracted ${links.length} links from website`);

        const chunks = await this.processDocuments(docs, userId, sourceMetadata);
        return { success: true, chunks, linksExtracted: links.length };
    }

    async ingestYouTube(url, userId) {
        console.log(`Ingesting YouTube: ${url} for user ${userId}`);
        const loader = YoutubeLoader.createFromUrl(url, {
            language: "en",
            addVideoInfo: true,
        });
        const docs = await loader.load();
        console.log(`Loaded YouTube transcript.`);

        // Extract video info from the loaded document
        const videoTitle = docs[0]?.metadata?.title || 'Unknown Video';
        const author = docs[0]?.metadata?.author || 'Unknown Author';

        const sourceMetadata = {
            sourceType: 'youtube',
            sourceId: `yt-${Date.now()}`,
            sourceUrl: url,
            videoTitle: videoTitle,
            author: author,
            ingestedAt: new Date().toISOString(),
            sourceDescription: `YouTube video: "${videoTitle}" by ${author}`,
        };

        const chunks = await this.processDocuments(docs, userId, sourceMetadata);
        return { success: true, chunks };
    }

    async query(question, userId) {
        console.log(`Querying: "${question}" for user ${userId}`);

        const vectorStore = await this.getVectorStore();

        // Detect if question is about specific source type
        const lowerQuestion = question.toLowerCase();
        let filter = {
            must: [
                {
                    key: "metadata.userId",
                    match: { value: userId }
                }
            ]
        };

        // Add source type filter if detected in question
        if (lowerQuestion.includes('youtube') || lowerQuestion.includes('video')) {
            filter.must.push({
                key: "metadata.sourceType",
                match: { value: "youtube" }
            });
            console.log('Filtering for YouTube sources only');
        } else if (lowerQuestion.includes('website') || lowerQuestion.includes('web page')) {
            filter.must.push({
                key: "metadata.sourceType",
                match: { value: "website" }
            });
            console.log('Filtering for website sources only');
        } else if (lowerQuestion.includes('pdf') || lowerQuestion.includes('document')) {
            filter.must.push({
                key: "metadata.sourceType",
                match: { value: "pdf" }
            });
            console.log('Filtering for PDF sources only');
        }

        const retriever = vectorStore.asRetriever({
            k: 15, // Retrieve more documents to ensure coverage of multiple sources and references
            filter: filter
        });

        const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful and conversational AI assistant. Answer questions based on the provided context.

CRITICAL RULES:
1. Each context chunk starts with [SOURCE: ...] - This tells you WHERE the information comes from
2. If the question asks about a SPECIFIC source (e.g., "the YouTube video", "the website"), use ONLY chunks from that source
3. NEVER mix information from different sources - treat each source as completely separate
4. When answering, cite which source you're using naturally (e.g., "According to the YouTube video...", "The website mentions...")
5. Pay special attention to the source description in [SOURCE: ...] to differentiate between similar content from different sources
6. If you have information from MULTIPLE sources, mention ALL of them in your answer

CONTEXTUAL NUANCE & REFERENCES:
- Be alert for "references to context" that might modify meaning (e.g., "Section A says X, but later it is clarified that Y")
- If one part of the context modifies, updates, or contradicts another part, prioritize the modifying/later information as the "current truth"
- Explicitly explain this distinction to the user: "The document initially states X, but later clarifies that Y..."

HANDLING MISSING INFORMATION:
- If you cannot find specific information, be helpful and suggest what you DO know
- Instead of just saying "I don't have that information", explain what information IS available
- For example:
  ✗ BAD: "I don't have that information in the website"
  ✓ GOOD: "I don't see specific pricing information on the website, but I can see it mentions [related info]. The website does include these links: [list relevant links]"

<context>
{context}
</context>

Question: {question}

Remember: Be conversational, helpful, and cite your sources naturally. Each [SOURCE: ...] header indicates a DIFFERENT source.
    `);

        const chain = await createStuffDocumentsChain({
            llm: this.llm,
            prompt: prompt,
            outputParser: new StringOutputParser(),
        });

        console.log('Invoking retriever...');
        let relevantDocs;
        try {
            // Add timeout to prevent hanging
            const retrievalPromise = retriever.invoke(question);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Retrieval timeout after 30s')), 30000)
            );

            relevantDocs = await Promise.race([retrievalPromise, timeoutPromise]);
            console.log(`Successfully retrieved ${relevantDocs.length} documents`);
        } catch (error) {
            console.error('Error during retrieval:', error);
            throw new Error(`Failed to retrieve documents: ${error.message}`);
        }

        if (relevantDocs.length === 0) {
            return "I couldn't find any relevant information in your documents.";
        }

        // Log retrieved docs for debugging and show source diversity
        console.log(`Retrieved ${relevantDocs.length} documents:`);
        const sourceMap = new Map();
        relevantDocs.forEach((doc, i) => {
            const sourceDesc = doc.metadata.sourceDescription || doc.metadata.sourceType || 'unknown';
            console.log(`  [${i}] ${sourceDesc}`);
            sourceMap.set(sourceDesc, (sourceMap.get(sourceDesc) || 0) + 1);
        });

        console.log('Source distribution:');
        sourceMap.forEach((count, source) => {
            console.log(`  - ${source}: ${count} chunks`);
        });

        const response = await chain.invoke({
            context: relevantDocs,
            question: question,
        });

        return response;
    }

    async deleteUserData(userId) {
        console.log(`[DELETE] Starting deletion for user: ${userId}`);

        try {
            const vectorStore = await this.getVectorStore();
            const client = vectorStore.client;
            const collectionName = 'rag_collection';

            // First, check how many points exist for this user
            const scrollResult = await client.scroll(collectionName, {
                filter: {
                    must: [
                        {
                            key: "metadata.userId",
                            match: { value: userId }
                        }
                    ]
                },
                limit: 100
            });

            console.log(`[DELETE] Found ${scrollResult.points?.length || 0} points to delete for user ${userId}`);

            if (scrollResult.points && scrollResult.points.length > 0) {
                // Delete by filter
                const deleteResult = await client.delete(collectionName, {
                    filter: {
                        must: [
                            {
                                key: "metadata.userId",
                                match: { value: userId }
                            }
                        ]
                    }
                });

                console.log(`[DELETE] Delete operation completed:`, deleteResult);
                console.log(`[DELETE] Successfully deleted all documents for user ${userId}`);
            } else {
                console.log(`[DELETE] No documents found for user ${userId}`);
            }

            return { success: true };
        } catch (error) {
            console.error(`[DELETE] Error deleting data for user ${userId}:`, error);
            console.error(`[DELETE] Error details:`, error.message, error.stack);
            throw error;
        }
    }
}
