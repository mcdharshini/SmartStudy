
import os
import json
import re
from groq import Groq
from typing import List, Dict, Any, Optional


class RagEngine:
    """Retrieval-Augmented Generation engine using Groq LLM.
    
    Provides AI-powered question answering and quiz generation capabilities
    using the Groq API with Llama 3.3 70B model.
    
    Attributes:
        api_key: Groq API key for authentication
        client: Groq client instance
        model: LLM model identifier (default: llama-3.3-70b-versatile)
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the RAG engine with Groq API.
        
        Args:
            api_key: Optional Groq API key. If not provided, reads from GROQ_API_KEY environment variable
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            print("Warning: GROQ_API_KEY not found in environment variables.")
        
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
        else:
            self.client = None
            
        self.model = "llama-3.3-70b-versatile"

    def set_api_key(self, api_key: str):
        """Update the Groq API key and reinitialize the client.
        
        Args:
            api_key: New Groq API key
        """
        self.api_key = api_key
        self.client = Groq(api_key=api_key)

    def generate_answer(self, question: str, context: str) -> str:
        """Generate an AI-powered answer to a question using provided context.
        
        Uses RAG approach to answer questions based on the provided context.
        Falls back to general knowledge if context is insufficient.
        
        Args:
            question: The question to answer
            context: Retrieved context from documents to base the answer on
            
        Returns:
            AI-generated answer with educational formatting and follow-up question
        """
        if not self.client:
            return "Error: Groq API Key is missing. Please configure it in the backend."

        system_prompt = """You are 'Smart Study Hub AI', an advanced and encouraging academic tutor.
Your goal is to help students understand their study materials deeply and prepare for exams.

Instructions:
1. **Source-Based Accuracy**: Answer the user's question primarily using the provided 'Context'. If the context contains the answer, cite it implicitly by explaining the concept clearly.
2. **Context Awareness**: If the context is empty or irrelevant to the question, state that you couldn't find specific information in the uploaded documents, but then provide a helpful answer based on your general knowledge.
3. **Educational Tone**: Be encouraging, clear, and concise. unexpected complex terms should be explained.
4. **Formatting**: 
   - Use **bold** for key terms.
   - Use lists (bullet points) for steps or features.
   - Use `> blockquotes` for important summaries or definitions.
5. **Engagement**: End your answer with a short, thought-provoking follow-up question to check their understanding or keep them studying."""

        user_content = f"""Context:
{context}

Question: 
{question}

Answer:"""

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                model=self.model,
                temperature=0.3,
                max_tokens=1024,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"Error generating answer: {str(e)}"

    def generate_quiz(self, topic: str, context: str, difficulty: str = "medium", num_questions: int = 5) -> Dict[str, Any]:
        """Generate a quiz with multiple choice and true/false questions.
        
        Creates quiz questions based on the provided context and topic.
        Handles JSON parsing and normalization of the AI response.
        
        Args:
            topic: The topic or subject for the quiz
            context: Document context to base questions on
            difficulty: Quiz difficulty level (easy, medium, hard)
            num_questions: Number of questions to generate
            
        Returns:
            Dictionary containing quiz questions with structure:
            {
                "questions": [
                    {
                        "questionText": str,
                        "type": "mcq" | "tf",
                        "options": [{"id": str, "text": str}, ...],
                        "correctOptionId": str,
                        "explanation": str
                    }
                ]
            }
            Returns error dict if generation fails
        """
        if not self.client:
            return {"error": "Groq API Key missing"}

        schema_instruction = """
        Return ONLY a raw JSON object (no markdown, no backticks) with the following structure:
        {
            "questions": [
                {
                    "questionText": "The actual question string?",
                    "type": "mcq"Or "tf" (True/False),
                    "options": [
                        {"id": "a", "text": "Option A text"},
                        {"id": "b", "text": "Option B text"},
                        {"id": "c", "text": "Option C text"},
                        {"id": "d", "text": "Option D text"}
                    ],
                    "correctOptionId": "b",
                    "explanation": "Why this is the correct answer."
                }
            ]
        }
        For True/False questions, options should be id "true" and "false".
        """

        prompt = f"""Generate a {difficulty} level quiz with {num_questions} questions about "{topic}".
        Use the provided context to ensure accurate questions.
        
        Context derived from documents:
        {context[:6000]}

        {schema_instruction}
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a quiz generator API. You strictly output JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                temperature=0.5,
            )
            
            content = chat_completion.choices[0].message.content
            print(f"DEBUG: Quiz Gen Raw Output: {content[:200]}...")
            
            content = content.replace("```json", "").replace("```", "").strip()
            
            json_match = re.search(r'(\{.*\}|\[.*\])', content, re.DOTALL)
            if json_match:
                possible_json = json_match.group(1)
                try:
                    parsed = json.loads(possible_json)
                except:
                    try:
                        parsed = json.loads(content)
                    except:
                        raise json.JSONDecodeError("Failed to parse matched JSON", possible_json, 0)
            else:
                parsed = json.loads(content)
            
            if isinstance(parsed, list):
                 parsed = {"questions": parsed}
                 
            if "questions" not in parsed:
                if "quiz" in parsed and "questions" in parsed["quiz"]:
                    parsed = parsed["quiz"]
                else:
                    for val in parsed.values():
                        if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict) and "questionText" in val[0]:
                            parsed = {"questions": val}
                            break
            
            if "questions" not in parsed or not isinstance(parsed["questions"], list):
                 return {"error": "Invalid JSON structure: 'questions' array missing or invalid", "raw": content}

            return parsed
        except json.JSONDecodeError:
            print(f"JSON Parse Error. Raw content: {content}")
            return {"error": "Failed to parse AI response as JSON", "raw_response": content}
        except Exception as e:
            return {"error": str(e)}
