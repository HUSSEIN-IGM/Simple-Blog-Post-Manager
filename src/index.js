const baseURL = "http://localhost:3001/posts";


document.addEventListener("DOMContentLoaded", () => {
  displayPosts();
  setupNewPostForm();
  setupEditPostForm();
});

function displayPosts() {
  fetch(baseURL)
    .then(res => res.json())
    .then(posts => {
      const postList = document.getElementById("post-list");
      postList.innerHTML = "";

      posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post-item";
        postDiv.textContent = post.title;
        postDiv.addEventListener("click", () => showPostDetail(post));
        postList.appendChild(postDiv);
      });

      if (posts.length > 0) showPostDetail(posts[0]);
    });
}

function showPostDetail(post) {
  const postDetail = document.getElementById("post-detail");
  postDetail.innerHTML = `
    <h2>${sanitize(post.title)}</h2>
    <p><em>by ${sanitize(post.author)}</em></p>
    <img src="${sanitize(post.image)}" width="250" />
    <p>${sanitize(post.content)}</p>
    <button id="delete-btn">Delete</button>
    <button id="edit-btn">Edit</button>
  `;

  // Event Listeners for Delete and Edit buttons
  document.getElementById("delete-btn").addEventListener("click", () => deletePost(post.id));
  document.getElementById("edit-btn").addEventListener("click", () => showEditForm(post));
}

function setupNewPostForm() {
  const form = document.getElementById("new-post-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newPost = {
      title: document.getElementById("new-title").value,
      author: document.getElementById("new-author").value,
      image: document.getElementById("new-image").value || "https://via.placeholder.com/150",
      content: document.getElementById("new-content").value
    };

    fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })
      .then(() => {
        form.reset();
        displayPosts();
      });
  });
}

function showEditForm(post) {
  const form = document.getElementById("edit-post-form");
  form.classList.remove("hidden");
  form.dataset.id = post.id;
  document.getElementById("edit-title").value = post.title;
  document.getElementById("edit-content").value = post.content;
}

function setupEditPostForm() {
  const form = document.getElementById("edit-post-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = form.dataset.id;

    const updatedPost = {
      title: document.getElementById("edit-title").value,
      content: document.getElementById("edit-content").value
    };

    fetch(`${baseURL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPost)
    })
      .then(() => {
        form.classList.add("hidden");
        form.reset();
        displayPosts();
        fetch(`${baseURL}/${id}`).then(res => res.json()).then(showPostDetail);
      });
  });

  document.getElementById("cancel-edit").addEventListener("click", () => {
    form.classList.add("hidden");
    form.reset();
    form.removeAttribute("data-id");
  });
}

function deletePost(id) {
  fetch(`${baseURL}/${id}`, {
    method: "DELETE"
  })
    .then(() => {
      displayPosts();
      document.getElementById("post-detail").innerHTML = "<p>Select a post to view details.</p>";
      document.getElementById("edit-post-form").classList.add("hidden");
    });
}

function sanitize(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[match];
  });
}
