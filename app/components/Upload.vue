<template>
    <div id="upload" class="container up-top">
        <div
            v-if="newPostOpen"
            class="new-post-backdrop"
            role="button"
            tabindex="0"
            @click.self="closeNewPost"
            @keydown.esc="closeNewPost"
        >
            <section class="new-post-modal">
                <button class="close-btn" type="button" @click="closeNewPost">
                    ×
                </button>

                <h2>Tauschangebot erstellen</h2>

                <p v-if="token" class="login-success">
                    Eingeloggt als {{ role === "admin" ? "Admin" : "User" }}
                </p>

                <form v-if="token" class="upload-form" @submit.prevent="upload">
                    <div class="form-group">
                        <label for="title">Titel</label>
                        <input
                            id="title"
                            v-model="title"
                            type="text"
                            maxlength="80"
                            placeholder="z.B. Geodreieck, fast neu"
                        />
                    </div>

                    <div class="form-group">
                        <label for="description">Beschreibung</label>
                        <textarea
                            id="description"
                            v-model="description"
                            maxlength="800"
                            rows="5"
                            placeholder="Beschreibe den Gegenstand kurz... (Schreibe bitte auch wie stark die Abnutzung ist.)"
                        />
                    </div>

                    <div class="form-group">
                        <label for="category">Kategorie</label>
                        <select id="category" v-model="category">
                            <option value="" disabled>
                                Kategorie auswählen
                            </option>
                            <option value="Schulmaterial">Schulmaterial</option>
                            <option value="Stifte">Stifte</option>
                            <option value="Bücher">Bücher</option>
                            <option value="Sportmaterialien">
                                Sportmaterialien
                            </option>
                            <option value="Anderes">Anderes</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="wishes">
                            Was wünscht du dir dafür? (Optional)</label
                        >
                        <textarea
                            id="wishes"
                            v-model="wishes"
                            maxlength="500"
                            rows="3"
                            placeholder="Was wünschst du dir dafür? z.B. Filzstift, Radiergummi, Notizbuch..."
                        />
                    </div>

                    <div class="upload-controls">
                        <label for="file-upload" class="custom-file-upload">
                            Bilder auswählen
                        </label>

                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            :disabled="isUploading || isCompressing"
                            @change="previewImages"
                        />

                        <button
                            :disabled="
                                isUploading ||
                                isCompressing ||
                                uploadCooldown > 0
                            "
                        >
                            {{ uploadButtonText }}
                        </button>
                    </div>

                    <p v-if="files.length" class="file-info">
                        {{ files.length }} Bild{{
                            files.length === 1 ? "" : "er"
                        }}
                        ausgewählt
                    </p>

                    <div v-if="previews.length" class="preview-grid">
                        <div
                            v-for="(item, index) in previews"
                            :key="item.url"
                            class="preview-card"
                            :class="{ selected: mainImageIndex === index }"
                        >
                            <button
                                type="button"
                                class="preview-select"
                                @click="mainImageIndex = index"
                            >
                                <img :src="item.url" alt="Vorschau" />
                                <span>
                                    {{
                                        mainImageIndex === index
                                            ? "Hauptbild"
                                            : "Als Hauptbild"
                                    }}
                                </span>
                            </button>

                            <button
                                type="button"
                                class="preview-remove"
                                aria-label="Bild entfernen"
                                @click="removePreviewImage(index)"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div class="rules-box">
                        <h3>Regeln</h3>

                        <ul>
                            <li>Nur Tausch — kein Geld.</li>
                            <li>
                                Sachen müssen sauber und funktionstüchtig sein.
                            </li>
                            <li>Respektvoller Umgang, keine Beleidigungen.</li>
                            <li>
                                Verbotene Gegenstände: Esswaren, Kleider und
                                Lebewesen.
                            </li>
                            <li>
                                Nach dem Trade den Gegenstand wieder von der
                                Website löschen.
                            </li>
                        </ul>

                        <label class="rules-accept">
                            <input v-model="rulesAccepted" type="checkbox" />
                            Ich akzeptiere diese Regeln.
                        </label>
                    </div>
                </form>

                <p v-else class="login-hint">
                    Bitte oben im Header einloggen oder registrieren, um
                    Angebote hochzuladen.
                </p>
            </section>
        </div>

        <section id="gallery" class="gallery-section">
            <div class="gallery-header">
                <h2>Tauschangebote</h2>

                <label class="category-filter">
                    Kategorie:
                    <select v-model="selectedCategory">
                        <option value="Alle">Alle</option>
                        <option value="Schulmaterial">Schulmaterial</option>
                        <option value="Stifte">Stifte</option>
                        <option value="Bücher">Bücher</option>
                        <option value="Sportmaterialien">
                            Sportmaterialien
                        </option>
                        <option value="Anderes">Anderes</option>
                    </select>
                </label>
            </div>

            <div class="gallery">
                <article
                    v-for="post in filteredPosts"
                    :key="post.id"
                    class="item"
                >
                    <div class="item-image-wrapper">
                        <button
                            class="post-preview"
                            type="button"
                            @click="
                                selectedPost = post;
                                loadMessages(post.id);
                            "
                        >
                            <img
                                :src="`/uploads/${post.mainImage}`"
                                alt="Tauschangebot"
                            />
                        </button>
                    </div>

                    <div class="item-content">
                        <button
                            class="post-title-btn"
                            type="button"
                            @click="
                                selectedPost = post;
                                loadMessages(post.id);
                            "
                        >
                            <strong>{{ post.title }}</strong>
                        </button>

                        <p class="category-badge">
                            {{ post.category }}
                        </p>

                        <button
                            v-if="canDelete(post)"
                            class="delete-btn"
                            type="button"
                            @click="remove(post.id)"
                        >
                            Löschen
                        </button>
                    </div>
                </article>
            </div>

            <p v-if="!filteredPosts.length" class="empty-gallery">
                Keine Angebote in dieser Kategorie gefunden.
            </p>
        </section>

        <div
            v-if="selectedPost"
            class="modal-backdrop"
            role="button"
            tabindex="0"
            @click.self="selectedPost = null"
            @keydown.esc="selectedPost = null"
        >
            <section class="modal modal-with-chat">
                <button
                    class="close-btn"
                    type="button"
                    @click="selectedPost = null"
                >
                    ×
                </button>

                <div class="modal-content-wrapper">
                    <div class="modal-left">
                        <div class="image-container">
                            <img
                                :src="`/uploads/${selectedPost.mainImage}`"
                                class="modal-main-image zoomable"
                                alt="Hauptbild"
                                @click="
                                    openZoom(
                                        `/uploads/${selectedPost.mainImage}`,
                                    )
                                "
                            />
                            <div class="zoom-hint">zum Vergrößern klicken</div>
                        </div>

                        <h2>{{ selectedPost.title }}</h2>

                        <p class="modal-category">
                            {{ selectedPost.category }}
                        </p>

                        <p class="modal-description">
                            {{ selectedPost.description }}
                        </p>

                        <div v-if="selectedPost.wishes" class="modal-wishes">
                            <strong> Wünsche:</strong>
                            <p>{{ selectedPost.wishes }}</p>
                        </div>

                        <div
                            v-if="selectedPost.images.length > 1"
                            class="modal-images"
                        >
                            <img
                                v-for="image in selectedPost.images"
                                :key="image"
                                :src="`/uploads/${image}`"
                                alt="Weiteres Bild"
                                class="zoomable"
                                @click="openZoom(`/uploads/${image}`)"
                                :title="`Klick zum Vergrößern`"
                            />
                        </div>

                        <div class="owner-info">
                            <p>
                                <strong>Name:</strong>
                                {{ selectedPost.ownerName }}
                            </p>
                            <p>
                                <strong>E-Mail:</strong>
                                {{ selectedPost.ownerEmail }}
                            </p>
                        </div>

                        <button
                            v-if="canComplete(selectedPost)"
                            class="modal-complete-btn"
                            type="button"
                            @click="completeTrade(selectedPost.id)"
                        >
                            ✅ Handel abgeschlossen
                        </button>

                        <button
                            v-if="canDelete(selectedPost)"
                            class="modal-delete-btn"
                            type="button"
                            @click="remove(selectedPost.id)"
                        >
                            Diesen Post löschen
                        </button>
                    </div>

                    <div class="modal-right">
                        <div class="chat-header">
                            <h3>Verhandlungen</h3>
                            <p class="chat-info">
                                {{ messages.length }}
                                {{
                                    messages.length === 1
                                        ? "Nachricht"
                                        : "Nachrichten"
                                }}
                            </p>
                        </div>

                        <div class="chat-messages" ref="messagesContainer">
                            <div
                                v-if="messages.length === 0"
                                class="no-messages"
                            >
                                <p>
                                    Noch keine Nachrichten.<br />Sei der Erste!
                                </p>
                            </div>

                            <div
                                v-for="msg in messages"
                                :key="msg.id"
                                class="message"
                                :class="{ own: msg.authorEmail === login }"
                            >
                                <div class="message-author">
                                    <strong>{{ msg.author }}</strong>
                                    <span class="message-time">{{
                                        formatTime(msg.createdAt)
                                    }}</span>
                                </div>
                                <div class="message-content">
                                    {{ msg.content }}
                                </div>
                            </div>
                        </div>

                        <div v-if="!token" class="login-required">
                            <p>
                                Bitte <strong>einloggen</strong>, um zu
                                verhandeln
                            </p>
                        </div>

                        <form
                            v-else
                            class="chat-form"
                            @submit.prevent="sendMessage"
                        >
                            <input
                                v-model="newMessage"
                                type="text"
                                placeholder="Deine Nachricht..."
                                maxlength="2000"
                                :disabled="isSending"
                            />
                            <button
                                type="submit"
                                :disabled="isSending || !newMessage.trim()"
                            >
                                {{ isSending ? "..." : "✓" }}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>

        <div
            v-if="zoomedImageUrl"
            class="zoom-backdrop"
            role="button"
            tabindex="0"
            @click="closeZoom"
            @keydown.esc="closeZoom"
        >
            <button class="zoom-close-btn" type="button" @click="closeZoom">
                ×
            </button>
            <img
                :src="zoomedImageUrl"
                class="zoom-image"
                alt="Vergrößerte Ansicht"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { compressImage } from "../utils/imageCompressor";

type ApiResult = {
    success?: boolean;
    error?: string;
};

type TradeCategory =
    "Schulmaterial" | "Stifte" | "Bücher" | "Sportmaterialien" | "Anderes";

type TradePost = {
    id: string;
    title: string;
    description: string;
    category: TradeCategory;
    images: string[];
    mainImage: string;
    ownerEmail: string;
    ownerName: string;
    createdAt: string;
    wishes?: string;
};

type Message = {
    id: string;
    postId: string;
    author: string;
    authorEmail: string;
    content: string;
    createdAt: string;
};

type UploadResult = ApiResult & {
    post?: TradePost;
};

type PostsResult = ApiResult & {
    posts?: TradePost[];
};

type MessagesResult = ApiResult & {
    messages?: Message[];
    message?: Message;
};

const newPostOpen = useState("newPostOpen", () => false);
const selectedCategory = ref<"Alle" | TradeCategory>("Alle");

const title = ref("");
const description = ref("");
const category = ref<TradeCategory | "">("");
const wishes = ref("");
const rulesAccepted = ref(false);

const files = ref<File[]>([]);
const previews = ref<{ file: File; url: string }[]>([]);
const mainImageIndex = ref(0);

const posts = ref<TradePost[]>([]);
const selectedPost = ref<TradePost | null>(null);

// Zoom-Funktionalität
const zoomedImageUrl = ref<string | null>(null);

// Chat related
const messages = ref<Message[]>([]);
const newMessage = ref("");
const isSending = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const filteredPosts = computed(() => {
    if (selectedCategory.value === "Alle") {
        return posts.value;
    }

    return posts.value.filter(
        (post) => post.category === selectedCategory.value,
    );
});

const token = useState<string | null>("authToken", () => null);
const role = useState<"admin" | "user" | null>("authRole", () => null);
const login = useState<string | null>("authLogin", () => null);

const uploadCooldown = ref(0);
const isUploading = ref(false);
const isCompressing = ref(false);

let uploadCooldownInterval: ReturnType<typeof setInterval> | null = null;
let messagesPollingInterval: ReturnType<typeof setInterval> | null = null;
let postsPollingInterval: ReturnType<typeof setInterval> | null = null;

const uploadButtonText = computed(() => {
    if (isCompressing.value) {
        return "Bilder werden verarbeitet...";
    }

    if (isUploading.value) {
        return "Wird hochgeladen...";
    }

    if (uploadCooldown.value > 0) {
        return `Warte ${uploadCooldown.value}s`;
    }

    return "Angebot veröffentlichen";
});

onMounted(() => {
    token.value = localStorage.getItem("token");
    role.value = localStorage.getItem("role") as "admin" | "user" | null;
    login.value = localStorage.getItem("login");
    loadPosts();

    // Poll for new/deleted posts from other users every 5 seconds
    postsPollingInterval = setInterval(loadPosts, 5000);

    window.addEventListener("keydown", handleGlobalKeyDown);
});

onBeforeUnmount(() => {
    if (uploadCooldownInterval) {
        clearInterval(uploadCooldownInterval);
    }

    if (messagesPollingInterval) {
        clearInterval(messagesPollingInterval);
    }

    if (postsPollingInterval) {
        clearInterval(postsPollingInterval);
    }

    clearPreviews();
    window.removeEventListener("keydown", handleGlobalKeyDown);
});

watch(messages, () => {
    setTimeout(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
                messagesContainer.value.scrollHeight;
        }
    }, 0);
});

function openZoom(url: string) {
    zoomedImageUrl.value = url;
}

function closeZoom() {
    zoomedImageUrl.value = null;
}

function handleGlobalKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        closeZoom();
    }
}

function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "jetzt";
    if (diffMins < 60) return `vor ${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `vor ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `vor ${diffDays}d`;

    return date.toLocaleDateString("de-DE");
}

function closeNewPost() {
    newPostOpen.value = false;
    resetForm();
}

function clearPreviews() {
    for (const preview of previews.value) {
        URL.revokeObjectURL(preview.url);
    }

    previews.value = [];
}

async function previewImages(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
        return;
    }

    clearPreviews();
    isCompressing.value = true;

    try {
        const rawFiles = Array.from(target.files).slice(0, 8);

        // Process all images sequentially to avoid browser tab memory crash on mobile devices
        const compressedFiles: File[] = [];
        for (const file of rawFiles) {
            const compressed = await compressImage(file);
            compressedFiles.push(compressed);
        }

        files.value = compressedFiles;
        previews.value = files.value.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        mainImageIndex.value = 0;
    } catch (err) {
        console.error("Fehler bei der Bildverarbeitung:", err);
    } finally {
        isCompressing.value = false;
    }
}

function removePreviewImage(index: number) {
    const preview = previews.value[index];

    if (!preview) {
        return;
    }

    URL.revokeObjectURL(preview.url);

    previews.value.splice(index, 1);
    files.value.splice(index, 1);

    if (!previews.value.length) {
        mainImageIndex.value = 0;
        return;
    }

    if (mainImageIndex.value === index) {
        mainImageIndex.value = 0;
        return;
    }

    if (mainImageIndex.value > index) {
        mainImageIndex.value -= 1;
    }
}

function canDelete(post: TradePost) {
    return role.value === "admin";
}

function canComplete(post: TradePost) {
    return post.ownerEmail === login.value;
}

async function upload() {
    if (isUploading.value || isCompressing.value || uploadCooldown.value > 0) {
        return;
    }

    if (!token.value) {
        alert("Bitte zuerst einloggen");
        return;
    }

    if (!title.value.trim()) {
        alert("Bitte einen Titel eingeben");
        return;
    }

    if (!description.value.trim()) {
        alert("Bitte eine Beschreibung eingeben");
        return;
    }

    if (!category.value) {
        alert("Bitte eine Kategorie auswählen");
        return;
    }

    if (!files.value.length) {
        alert("Bitte mindestens ein Bild auswählen");
        return;
    }

    if (!rulesAccepted.value) {
        alert("Bitte die Regeln akzeptieren");
        return;
    }

    isUploading.value = true;

    try {
        const form = new FormData();

        form.append("title", title.value.trim());
        form.append("description", description.value.trim());
        form.append("category", category.value);
        form.append("wishes", wishes.value.trim());
        form.append("mainImageIndex", String(mainImageIndex.value));
        form.append("rulesAccepted", String(rulesAccepted.value));

        for (const file of files.value) {
            form.append("files", file);
        }

        const res = await $fetch<UploadResult>("/api/upload", {
            method: "POST",
            body: form,
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (res.error) {
            alert(res.error);
            return;
        }

        startUploadCooldown();
        resetForm();
        newPostOpen.value = false;

        // Optimistic update: prepend new post locally so the gallery updates instantly
        if (res.post) {
            posts.value = [res.post as TradePost, ...posts.value];
        } else {
            await loadPosts();
        }
    } catch (err: any) {
        console.error("Upload error:", err);

        let message = "Ein Fehler ist aufgetreten";

        if (err.status === 413) {
            message =
                "Die hochgeladenen Bilder sind insgesamt zu groß für den Server (max. 20MB gesamt).";
        } else {
            message =
                err.data?.statusMessage ||
                err.statusMessage ||
                err.message ||
                message;
        }

        alert(`Upload fehlgeschlagen: ${message}`);
    } finally {
        isUploading.value = false;
    }
}

function resetForm() {
    title.value = "";
    description.value = "";
    category.value = "";
    wishes.value = "";
    rulesAccepted.value = false;
    files.value = [];
    mainImageIndex.value = 0;
    clearPreviews();
}

function startUploadCooldown() {
    uploadCooldown.value = 10;

    if (uploadCooldownInterval) {
        clearInterval(uploadCooldownInterval);
    }

    uploadCooldownInterval = setInterval(() => {
        uploadCooldown.value -= 1;

        if (uploadCooldown.value <= 0 && uploadCooldownInterval) {
            clearInterval(uploadCooldownInterval);
            uploadCooldownInterval = null;
        }
    }, 1000);
}

async function remove(id: string) {
    if (!token.value) {
        alert("Bitte zuerst einloggen");
        return;
    }

    if (!confirm("Diesen Post wirklich löschen?")) {
        return;
    }

    try {
        const res = await $fetch<ApiResult>("/api/delete", {
            method: "POST",
            body: { id },
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (res.error) {
            alert(res.error);
            return;
        }

        // Optimistic update: remove from local list instantly
        posts.value = posts.value.filter((p) => p.id !== id);
        if (selectedPost.value?.id === id) {
            selectedPost.value = null;
        }
    } catch (err: any) {
        const message =
            err.data?.statusMessage ||
            err.statusMessage ||
            err.message ||
            "Löschen fehlgeschlagen";
        alert(`Fehler beim Löschen: ${message}`);
    }
}

async function completeTrade(id: string) {
    if (!token.value) {
        alert("Bitte zuerst einloggen");
        return;
    }

    if (
        !confirm(
            "Handel als abgeschlossen markieren? Der Post wird danach gelöscht.",
        )
    ) {
        return;
    }

    try {
        const res = await $fetch<ApiResult>("/api/delete", {
            method: "POST",
            body: { id },
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (res.error) {
            alert(res.error);
            return;
        }

        // Optimistic update: remove from local list instantly
        posts.value = posts.value.filter((p) => p.id !== id);
        if (selectedPost.value?.id === id) {
            selectedPost.value = null;
        }
    } catch (err: any) {
        const message =
            err.data?.statusMessage ||
            err.statusMessage ||
            err.message ||
            "Fehler";
        alert(`Fehler: ${message}`);
    }
}

async function loadPosts() {
    const res = await $fetch<PostsResult>("/api/images");

    if (res.error) {
        alert(res.error);
        return;
    }

    posts.value = res.posts ?? [];
}

async function loadMessages(postId: string) {
    try {
        const res = await $fetch<MessagesResult>("/api/messages", {
            query: { postId },
        });

        if (res.messages) {
            messages.value = res.messages;
        }

        if (messagesPollingInterval) {
            clearInterval(messagesPollingInterval);
        }

        messagesPollingInterval = setInterval(async () => {
            try {
                const updated = await $fetch<MessagesResult>("/api/messages", {
                    query: { postId },
                });
                if (updated.messages) {
                    messages.value = updated.messages;
                }
            } catch (err) {
                console.error("Error polling messages:", err);
            }
        }, 1000);
    } catch (err: any) {
        console.error("Error loading messages:", err);
    }
}

async function sendMessage() {
    if (!token.value || !selectedPost.value || !newMessage.value.trim()) {
        return;
    }

    isSending.value = true;

    try {
        const res = await $fetch<MessagesResult>("/api/messages", {
            method: "POST",
            body: {
                postId: selectedPost.value.id,
                content: newMessage.value.trim(),
            },
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        if (res.error) {
            alert(res.error);
            return;
        }

        newMessage.value = "";
        await loadMessages(selectedPost.value.id);
    } catch (err: any) {
        const message =
            err.data?.statusMessage ||
            err.statusMessage ||
            err.message ||
            "Fehler beim Senden";
        alert(`Nachricht konnte nicht gesendet werden: ${message}`);
    } finally {
        isSending.value = false;
    }
}
</script>

<style scoped>
.container {
    max-width: 1000px;
    margin: 40px auto;
    text-align: center;
    padding: 0 20px;
}

.login-success {
    margin: 0 0 20px;
    color: var(--success);
    font-weight: 600;
}

.login-hint {
    color: var(--text-muted);
    margin-bottom: 20px;
}

.upload-form {
    max-width: 720px;
    margin: 0 auto;
    text-align: left;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
}

.form-group {
    display: grid;
    gap: 8px;
    margin-bottom: 16px;
}

.form-group label {
    font-weight: 700;
}

.form-group input,
.form-group textarea,
.form-group select,
.category-filter select {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 12px;
    background: var(--background);
    color: var(--text-main);
    font: inherit;
}

.upload-controls {
    display: flex;
    gap: 12px;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

#file-upload {
    display: none;
}

.custom-file-upload {
    background-color: var(--btn-secondary-bg);
    color: var(--btn-secondary-text);
    border: 1px solid var(--border);
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    display: inline-block;
}

.custom-file-upload:hover {
    background-color: var(--btn-secondary-hover);
    border-color: var(--accent);
}

button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
}

.file-info {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 20px;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin: 20px 0;
}

.preview-card {
    position: relative;
    border: 2px solid var(--border);
    background: var(--bg);
    color: var(--text);
    border-radius: 12px;
    overflow: hidden;
}

.preview-card.selected {
    border-color: var(--accent);
}

.preview-select {
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    text-align: center;
}

.preview-select img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
}

.preview-select span {
    display: block;
    padding: 8px;
    font-size: 12px;
    font-weight: 700;
}

.preview-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0 0 2px;
    border: 0;
    border-radius: 999px;
    background: var(--danger);
    color: var(--danger-text);
    cursor: pointer;
    font-size: 20px;
    font-weight: 800;
    line-height: 1;
}

.preview-remove:hover {
    background: var(--danger-hover);
}

.rules-box {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    margin-top: 20px;
    background: var(--bg);
}

.rules-box h3 {
    margin-top: 0;
}

.rules-box ul {
    margin: 0 0 14px;
    padding-left: 20px;
}

.rules-accept {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 700;
}

.gallery-section {
    margin-top: 20px;
}

.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.gallery-header h2 {
    margin: 0;
}

.category-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
}

.category-filter select {
    width: auto;
    min-width: 170px;
}

.gallery {
    margin-top: 40px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.empty-gallery {
    color: var(--text-muted);
    font-style: italic;
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 20px;
}

.item {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--bg-surface);
    border: 1px solid var(--border);
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.item:hover {
    border-color: var(--accent);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.item-image-wrapper {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 0;
}

.post-preview {
    width: 100%;
    height: 100%;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
}

.post-preview:hover {
    box-shadow: none;
    transform: none;
}

.post-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.post-preview:hover img {
    transform: scale(1.05);
}

.item-content {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-grow: 1;
}

.post-title-btn {
    text-align: left;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--text-main);
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    transition: color 0.2s ease;
    box-shadow: none;
}

.post-title-btn:hover {
    transform: none;
}

.post-title-btn:hover {
    color: var(--accent);
}

.category-badge {
    margin: 4px 0 8px;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    display: inline-block;
}

.delete-btn {
    align-self: flex-start;
    background-color: var(--danger);
    color: var(--danger-text);
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    box-shadow: none;
}

.delete-btn:hover {
    background-color: var(--danger-hover);
    transform: scale(1.05);
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    padding: 20px;
    z-index: 1000;
    overflow-y: auto;
}

.new-post-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    padding: 20px;
    z-index: 1000;
    overflow-y: auto;
}

.new-post-modal {
    background: var(--bg-surface);
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.modal {
    background: var(--bg-surface);
    border-radius: 12px;
    padding: 24px;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.modal-with-chat {
    max-height: 90vh;
}

.modal-content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.modal-left {
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: left;
}

.image-container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg);
}

.modal-main-image {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: cover;
    display: block;
    border-radius: 12px;
    cursor: zoom-in;
    transition: filter 0.2s ease;
}

.modal-main-image:hover {
    filter: brightness(0.9);
}

.zoom-hint {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.image-container:hover .zoom-hint {
    opacity: 1;
}

.modal-left h2 {
    margin: 0;
}

.modal-category {
    color: var(--text-muted);
    font-weight: 600;
    font-size: 12px;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.modal-description {
    margin: 0;
    color: var(--text-main);
    line-height: 1.6;
}

.modal-wishes {
    background: var(--bg);
    border-left: 3px solid var(--accent);
    border-radius: 6px;
    padding: 12px;
    margin-top: 8px;
}

.modal-wishes strong {
    display: block;
    margin-bottom: 8px;
    color: var(--accent);
}

.modal-wishes p {
    margin: 0;
    color: var(--text-main);
    font-size: 14px;
}

.modal-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
}

.modal-images img {
    width: 100%;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    cursor: zoom-in;
    transition: all 0.2s ease;
    border: 1px solid var(--border);
}

.modal-images img:hover {
    transform: scale(1.05);
    border-color: var(--accent);
}

.owner-info {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
}

.owner-info p {
    margin: 6px 0;
}

.modal-delete-btn {
    align-self: flex-start;
    background-color: var(--danger);
    color: var(--danger-text);
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
}

.modal-delete-btn:hover {
    background-color: var(--danger-hover);
    transform: scale(1.05);
}

.modal-complete-btn {
    align-self: flex-start;
    background-color: var(--green-600);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
    box-shadow: none;
}

.modal-complete-btn:hover {
    background-color: var(--green-500);
    transform: scale(1.05);
    box-shadow: none;
}

.modal-right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 400px;
    border-left: 1px solid var(--border);
    padding-left: 16px;
}

.chat-header {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
}

.chat-header h3 {
    margin: 0 0 4px;
    font-size: 16px;
}

.chat-info {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
}

.chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 0;
    max-height: 300px;
}

.no-messages {
    text-align: center;
    color: var(--text-muted);
    padding: 40px 20px;
    font-style: italic;
    font-size: 14px;
    margin: auto;
}

.message {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    border-left: 3px solid var(--accent);
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 13px;
    word-wrap: break-word;
}

.message.own {
    background: color-mix(in srgb, var(--success) 8%, transparent);
    border-left-color: var(--success);
    margin-left: auto;
    max-width: 85%;
}

.message-author {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 3px;
}

.message-author strong {
    font-weight: 700;
    font-size: 12px;
    color: var(--text-main);
}

.message-time {
    font-size: 11px;
    color: var(--text-muted);
}

.message-content {
    color: var(--text-main);
    margin: 0;
    line-height: 1.4;
}

.login-required {
    text-align: center;
    color: var(--text-muted);
    padding: 16px 12px;
    border: 1px dashed var(--border);
    border-radius: 6px;
    font-size: 13px;
    margin: 8px 0;
}

.chat-form {
    display: flex;
    gap: 6px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
}

.chat-form input {
    flex-grow: 1;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--background);
    color: var(--text-main);
    font: inherit;
    font-size: 13px;
}

.chat-form input::placeholder {
    color: var(--text-muted);
}

.chat-form input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent);
}

.chat-form button {
    background-color: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    min-width: 44px;
    text-align: center;
}

.chat-form button:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
}

.chat-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    padding: 0;
    box-shadow: none;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: var(--text-main);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    z-index: 10;
}

.close-btn:hover {
    background: var(--danger);
    color: white;
    box-shadow: none;
}

.zoom-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    display: grid;
    place-items: center;
    z-index: 2000;
    padding: 40px 20px;
    overflow: auto;
}

.zoom-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 8px;
    animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.zoom-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    z-index: 2001;
}

.zoom-close-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.6);
    transform: scale(1.1);
}

@media (max-width: 900px) {
    .modal-content-wrapper {
        grid-template-columns: 1fr;
    }

    .modal-right {
        border-left: none;
        border-top: 1px solid var(--border);
        padding-left: 0;
        padding-top: 16px;
        min-height: auto;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 12px;
    }

    .gallery {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
    }

    .item-image-wrapper {
        height: 180px;
    }

    /* On mobile the backdrop scrolls the whole modal — no inner scroll */
    .modal-backdrop,
    .new-post-backdrop {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 0;
    }

    .modal,
    .new-post-modal {
        max-height: none; /* let the modal grow to its natural height */
        overflow-y: visible; /* backdrop handles scrolling, not the modal */
        border-radius: 0;
        width: 100%;
        padding: 16px;
        padding-top: 56px; /* room for the always-visible close button */
    }

    /* Pin the close button so it stays reachable regardless of scroll */
    .close-btn {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 1010;
    }

    .modal-left {
        gap: 12px;
    }

    .chat-messages {
        max-height: 250px;
    }

    .preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
    }
}

@media (max-width: 480px) {
    .container {
        margin: 20px auto;
    }

    .gallery {
        grid-template-columns: 1fr;
    }

    .upload-form {
        padding: 16px;
    }

    .modal,
    .new-post-modal {
        width: 100%;
        max-height: none; /* already handled by the 768px rule */
        border-radius: 0;
        padding: 12px;
        padding-top: 56px; /* keep room for the fixed close button */
    }

    .modal-main-image {
        max-height: 300px;
    }

    .modal-right {
        min-height: 300px;
    }

    .chat-form input {
        font-size: 16px;
    }

    .preview-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .message.own {
        max-width: 90%;
    }
}
</style>
