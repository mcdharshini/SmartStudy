
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
console.log("Using API_URL:", API_URL);

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    message?: string;
}

export const api = {
    async uploadPdf(file: File, notebookId?: string) {
        try {
            const formData = new FormData();
            formData.append("pdf", file);
            if (notebookId) formData.append("notebook_id", notebookId);

            const res = await fetch(`${API_URL}/upload_pdf`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
            return await res.json();
        } catch (error) {
            console.error("API Error (uploadPdf):", error);
            throw error;
        }
    },

    async uploadUrl(url: string, name?: string, notebookId?: string) {
        try {
            const res = await fetch(`${API_URL}/upload_url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, name, notebook_id: notebookId }),
            });

            if (!res.ok) throw new Error(`URL upload failed: ${res.statusText}`);
            return await res.json();
        } catch (error) {
            console.error("API Error (uploadUrl):", error);
            throw error;
        }
    },

    async ask(question: string, filename?: string) {
        try {
            const formData = new FormData();
            formData.append("question", question);
            if (filename) formData.append("filename", filename);

            const res = await fetch(`${API_URL}/ask`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error(`Ask failed: ${res.statusText}`);
            return await res.json();
        } catch (error) {
            console.error("API Error (ask):", error);
            throw error;
        }
    },

    async healthCheck() {
        try {
            const res = await fetch(`${API_URL}/health_check`);
            if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
            return await res.json();
        } catch (error) {
            console.error("API Error (healthCheck):", error);
            throw error;
        }
    },

    async generateQuiz(topic: string, difficulty: string = "medium", notebookId?: string) {
        try {
            const res = await fetch(`${API_URL}/generate_quiz`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    notebookId,
                    num_questions: 5
                }),
            });

            if (!res.ok) throw new Error(`Quiz generation failed: ${res.statusText}`);
            return await res.json();
        } catch (error) {
            console.error("API Error (generateQuiz):", error);
            throw error;
        }
    }
};
