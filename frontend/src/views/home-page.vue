<template>
  <div>
    <app-header></app-header>

    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <!-- Create post section -->
    <div class="create-post">
      <div class="user-profile">
        <img v-if="user && user.image_url" crossorigin="anonymous" :src="user.image_url" alt="Profile Image" class="profile-image" />
        <font-awesome-icon v-else :icon="['fas', 'user']" class="user-icon" />
        <label for="post-content" class="visually-hidden">What's on your mind?</label>
        <textarea id="post-content" class="post-input" placeholder="What's on your mind?" v-model="postContent"></textarea>
      </div>

      <div class="uploaded-image-container">
        <img class="uploaded-image" :src="previewUrl" alt="Uploaded Image" v-if="previewUrl" />
        <button class="delete-button" @click="clearSelectedFile" v-if="previewUrl">x</button>
      </div>

      <div class="post-actions">       
        <label for="file-upload" class="file-label"> Upload Image
          <font-awesome-icon :icon="['fas', 'image']" class="icon-post"/>
        </label>
        <input type="file" id="file-upload" name="image_url" class="file-input" ref="fileInput" @change="onFileChange" />
        <button class="post-button" @click="createPost"> Create Post
          <font-awesome-icon :icon="['fas', 'paper-plane']" class="icon-post"/>
        </button>
      </div>
    </div>

    <!-- Display posts -->
    <div class="post-container" v-for="post in posts" :key="post.post_id">
      <div class="post-container-border">
        <div class="user-section">
          <img v-if="post.user && post.user_image" crossorigin="anonymous" :src="post.user_image" alt="User Profile Image" class="profile-image-display-post" />
          <font-awesome-icon v-else :icon="['fas', 'user']" class="user-icon-posts"/>
          <div class="user-details">
            <div class="user-name">{{ post.firstname }} {{ post.lastname }}</div>
            <div class="post-date">{{ formatDate(post.created_at) }}</div>
          </div>
        </div>

        <div class="post-options">
          <div v-if="userData && userData.user_id === post.user_id && post.showOptions" @click="toggleEditMode(post)">
            <div class="update-post-content">
              <font-awesome-icon :icon="['fas', 'pencil-alt']" class="update-post-icon" />
              <span class="edit-post-text">Edit</span>
              </div>
            </div>

          <div v-if="userData && userData.user_id === post.user_id && post.showOptions" @click="confirmDeletePost(post)">
            <div class="delete-post-content">
              <font-awesome-icon :icon="['fas', 'trash']" class="delete-post-icon" />
              <span class="delete-post-text">Delete</span>
            </div>
          </div>

          <font-awesome-icon v-if="userData && userData.user_id === post.user_id" icon="ellipsis-h" class="ellipsis-icon" @click="toggleOptions(post)"/>
        </div>
      <div>
        <font-awesome-icon v-if="editingPostId === post.post_id" :icon="['fas', 'check']" class="save-post-icon" @click="updatePostText(post)" />
      </div>

      <div class="post-text" v-if="editingPostId !== post.post_id">
        {{ post.textual_post }}
      </div>

      <textarea v-else v-model="newTextualPost" class="update-post-input"></textarea>

      <img v-if="post.image_url" crossorigin="anonymous" :src="post.image_url" alt="Posted Image" class="post-image" /> 
      </div>

      <div class="like-comment-section">
        <div  class="like-section">
          <div @click="handleLikeAction(post)" class="like-icon" :class="{ 'liked': post.userLiked }">
            <font-awesome-icon :icon="['fas', 'thumbs-up']" class="icon" />
            <span class="like-count">{{ post.totalLikes }}</span>
            <span v-if="post.userLiked" class="like-text">Liked</span>
          </div>
        </div>

        <div class="comment-section">
          <div @click="toggleCommentInput(post)" class="comment-icon">
            <font-awesome-icon :icon="['fas', 'comment']"/>
            <span class="comment-count">{{ post.totalComments }}</span>
          </div>
        </div>
      </div>   

        <div class="comment-input" v-if="post.showCommentInput">
          <input type="text" class="comment-input-text" v-model="post.newComment" @keyup.enter="addComment(post)" placeholder="  Add a comment" />
          <font-awesome-icon @click="addComment(post)" :icon="['fas', 'paper-plane']" class="save-comment" />
        </div>

        <div class="post-comments-section">
          <div class="comment" v-for="comment in post.comments" :key="comment.comment_id">
            <div class="comment-details-container">
              <img v-if="comment.user && comment.user.image_url" crossorigin="anonymous" :src="comment.user.image_url" alt="User Profile Image" class="comment-user-image" />
              <font-awesome-icon v-else :icon="['fas', 'user']" class="comment-user-icon" />
              <div class="comment-details">
                <span class="comment-user-name">{{ comment.firstname }} {{ comment.lastname }}</span>
                <p class="comment-posted-date">Posted on {{ formatDate(comment.created_at) }}</p>
              </div>
            </div>

            <div class="comment-actions">
              <font-awesome-icon v-if="userData && userData.user_id === comment.user_id && !comment.showOptions" icon="ellipsis-h" class="ellipsis-icon" @click="toggleOptionsComment(comment)" />
              <div class="comment-actions-container" v-if="comment.showOptions">
                <font-awesome-icon v-if="userData && userData.user_id === comment.user_id" :icon="['fas', 'pencil-alt']" class="comment-edit-icon" @click="editComment(comment)" />
                <font-awesome-icon v-if="userData && userData.user_id === comment.user_id" :icon="['fas', 'trash']" class="comment-delete-icon" @click="confirmDeleteComment(comment)" />
              </div>
            </div>

            <div v-if="editingCommentId === comment.comment_id">
              <input type="text" class="edit-comment-input" v-model="editedComment" />
              <font-awesome-icon class="save-edit-comment" @click="saveEditedComment(comment)" :icon="['fas', 'check']"/>
            </div>

            <div class="comment-text">{{ comment.comment }}</div>

          </div>
        </div>
    </div>
  </div>
</template>

<script>  
import AppHeader from "@/components/app-header.vue";
import * as postUtils from "@/utils/postUtils";
import axios from "axios";

export default {
  components: {
  AppHeader,
  },
  computed: {
    userData() {
    const userDataFromVuex = this.$store.state.user;
    if (userDataFromVuex) {
      return userDataFromVuex;
    }

    const userDataFromLocalStorage = JSON.parse(localStorage.getItem('user'));
    if (userDataFromLocalStorage !== null) {
      return userDataFromLocalStorage;
    }
    return null;
    },
  },
  data() {
    return {
      user: null,
      postContent: '',
      selectedFile: null, 
      previewUrl: null,
      successMessage: '',
      errorMessage: '',
      posts: [],
      showOptions: false,
      comments: [],
      editingPostId: null,
      editingCommentId: null,
      editedComment: "",
    };
  },
  methods: {
    onFileChange(event) {
      this.selectedFile = event.target.files[0];
      this.previewUrl = URL.createObjectURL(this.selectedFile);
    },
    
    clearSelectedFile() {
      this.selectedFile = null;
      this.previewUrl = null;

      const input = this.$refs.fileInput;
      input.value = '';
    },

    formatDate(dateTimeString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateTimeString).toLocaleDateString(undefined, options);
    },

    toggleEditMode(post) {
      this.editingPostId = post.post_id;
      this.newTextualPost = post.textual_post;
    },

    toggleOptions(post) {
      post.showOptions = !post.showOptions;
    },

    toggleOptionsComment(comment) {
      comment.showOptions = !comment.showOptions;
    },

    editComment(comment) {
      this.editingCommentId = comment.comment_id;
      this.editedComment = comment.comment;     
    },

    async fetchUserData() {
      const token = localStorage.getItem('token');
      const userId = this.$store.state.user.user_id;

    try {
      const response = await axios.get(`/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {   
        const user = response.data.user;

        this.$store.commit('setUser', user);
        localStorage.setItem('user', JSON.stringify(user));
        this.user = user;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    },

    async createPost() {
      await postUtils.createPost.call(this);
    },

    async fetchPosts() {
      await postUtils.fetchPosts.call(this);
    },

    async updatePostText(post) {
      await postUtils.updatePostText.call(this, post);
    },

    async confirmDeletePost(post) {
      await postUtils.confirmDeletePost.call(this, post);
    },

    async deletePost(post) {
      await postUtils.deletePost.call(this, post);
    },

    async toggleCommentInput(post) {
      await postUtils.toggleCommentInput.call(this, post);
    },

    async addComment(post) {
      await postUtils.addComment.call(this, post);
    },

    async fetchComments(post) {
      await postUtils.fetchComments.call(this, post);
    },

    async loadPostsAndComments() {
      await postUtils.loadPostsAndComments.call(this);
    },  
    
    async saveEditedComment(comment) {
      await postUtils.saveEditedComment.call(this, comment);
    },

    async confirmDeleteComment(comment) {
      postUtils.confirmDeleteComment.call(this, comment);
    },

    async deleteComment(comment) {
      await postUtils.deleteComment.call(this, comment);
    },

    async handleLikeAction(post, action) {
      await postUtils.handleLikeAction.call(this, post, action);
    },

    async fetchLikes(post) {
      await postUtils.fetchLikes.call(this, post);
    },
  },

  created() {
    this.fetchUserData();
    this.fetchPosts();
    this.loadPostsAndComments();
  },
};
</script>

<style lang="scss">
@import '@/styles/main';

.user-profile {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
  }
   
  .profile-image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 30px;
    object-fit: cover;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }

  .create-post {
    display: flex;
    flex-direction: column; 
    justify-content: center; 
    align-items: center; 
    padding: 20px 30px;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    max-width: 60%; 
    margin: 110px auto 10px auto; 
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }
  
  .post-input {
    flex: 1;
    width: 100%;
    padding: 10px;
    height: 50px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
  }

  .uploaded-image-container {
    position: relative;
  }
  
  .uploaded-image {
    max-width: 100%;
    max-height: 250px;
    margin: 10px 0;
  }
  
  .delete-button {
    position: absolute;
    top: -2px;
    right: -10px;
    background: transparent;
    border: none;
    font-size: 20px;
    font-weight: bold;
    color: red;
    cursor: pointer;
  }

  .post-container {
    position: relative;
    display: flex;
    flex-direction: column; 
    justify-content: center; 
    padding: 20px 25px;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    max-width: 50%; 
    margin: 10px auto; 
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }

  .post-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 10px;
  }

  .file-label {
    cursor: pointer;  
    color: rgb(5, 5, 153);
  }

  .file-input {
    width: 50%;
    display: none;
  }

  .post-button {
    cursor: pointer;
    margin-left: 100px;
    color: rgb(70, 70, 72);
    background-color: white;
    border: none;
    color: rgb(5, 5, 153);
    font-family: Georgia, "Times New Roman", Times, serif, Helvetica, Arial, sans-serif;
    font-size: 16px;
  }
  
  .icon-post {
    color: rgb(59, 4, 137);
    font-size: 16px;
    margin-left: 5px;
  }

@media (max-width: 1200px) and (min-width: 1001px) {
  .create-post {
  max-width: 80%;
}

.post-container {
  max-width: 70%;
  }  
  
.post-image {
  height: 400px!important;
}  
}


@media (max-width: 1000px) and (min-width: 769px) {
.create-post {
  max-width: 80%;
}

.post-container {
  max-width: 75%;
} 
  
.post-image {
  height: 350px!important;
}  
}

@media (max-width: 768px) {
.create-post {
  margin: 80px 0 15px 0;
  padding: 10px;
  max-width: 100%;
}

.user-profile {
  margin-top: 10px!important;
}

.file-label {
  font-size: 15px;
}

.post-button {
  font-size: 15px;
  margin-left: 40px;
}

.profile-image {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.user-icon {
  font-size: 25px!important;
}

.like-comment-section {
  margin-bottom: 0;
}

.post-input {
  padding: 5px;
  height: 30px;
}

.post-options {
  right: 15px;
}

.post-container {
  padding: 10px;
  margin-top: 10px;
  max-width: 100%;
}
.user-name {
  font-size: 15px;
}

.post-date {
  font-size: 13px;
}

.post-image {
  height: 300px!important;
}

.update-post-icon,
.delete-post-icon {
  font-size: 12px;
}

.comment {
  padding-top: 5px;
  padding-bottom: 3px;
}

.comment-user-icon {
  padding: 5px;
  font-size: 15px!important;
}

.comment-input {
  padding-top: 0;
  padding-bottom: 0;
}

.comment-user-name {
  font-size: 14px;
}

.comment-posted-date {
  font-size: 13px;
  margin: 0px;
}

.comment-text {
  font-size: 13px;
}
}

</style>
