/**
 * Mastodon embed feed timeline v3.13.2
 * More info at:
 * https://gitlab.com/idotj/mastodon-embed-feed-timeline
 */

/**
 * Timeline settings
 * Adjust these parameters to customize your timeline
 */
window.addEventListener("load", () => {
  const mastodonTimeline = new MastodonApi({
    // Id of the <div> containing the timeline
    container_body_id: "mt-body",

    // Class name for the loading spinner (also used in CSS file)
    spinner_class: "loading-spinner",

    // Preferred color theme: 'light', 'dark' or 'auto'. Default: auto
    default_theme: "auto",

    // Your Mastodon instance
    instance_url: "https://verse.aubrielee.com",

    // Choose type of posts to show in the timeline: 'local', 'profile', 'hashtag'. Default: local
    timeline_type: "",
//     timeline_type: "profile",

    // Your user ID number on Mastodon instance. Leave it empty if you didn't choose 'profile' as type of timeline
    user_id: "109599644401889599",

    // Your user name on Mastodon instance (including the @ symbol at the beginning). Leave it empty if you didn't choose 'profile' as type of timeline
    profile_name: "@Aubrie",

    // The name of the hashtag (not including the # symbol). Leave it empty if you didn't choose 'hashtag' as type of timeline
    hashtag_name: "",

    // Maximum amount of posts to get. Default: 20
    posts_limit: "8",

    hidePinnedPosts: false,

    // Hide unlisted posts. Default: don't hide
    hide_unlisted: false,

    // Hide boosted posts. Default: don't hide
    hide_reblog: true,

    // Hide replies posts. Default: don't hide
    hide_replies: true,

    // Hide video image preview and load video player instead. Default: don't hide
    hide_video_preview: false,

    // Hide preview card if post contains a link, photo or video from a URL. Default: don't hide
    hide_preview_link: false,

    // Hide custom emojis available on the server. Default: don't hide
    hide_emojos: false,

    // Converts Markdown symbol ">" at the beginning of a paragraph into a blockquote HTML tag. Ddefault: don't apply
    markdown_blockquote: false,

    // Hide replies, boosts and favourites posts counter. Default: don't hide
    hide_counter_bar: false,

    // Limit the text content to a maximum number of lines. Default: 0 (unlimited)
    text_max_lines: "0",

    // Customize the text of the link pointing to the Mastodon page (appears after the last post)
    link_see_more: "Read more posts on Mastodon",
  });
});

/**
 * Set all variables with customized values or use default ones
 * @param {object} params_ User customized values
 * Trigger main function to build the timeline
 */
const MastodonApi = function (params_) {
  this.CONTAINER_BODY_ID = document.getElementById(
    params_.container_body_id || "mt-body"
  );
  this.SPINNER_CLASS = params_.spinner_class || "loading-spinner";
  this.DEFAULT_THEME = params_.default_theme || "auto";
  this.INSTANCE_URL = params_.instance_url;
  this.USER_ID = params_.user_id || "";
  this.PROFILE_NAME = this.USER_ID ? params_.profile_name : "";
  this.TIMELINE_TYPE = params_.timeline_type || "local";
  this.HASHTAG_NAME = params_.hashtag_name || "";
  this.postS_LIMIT = params_.posts_limit || "20";
  this.HIDE_UNLISTED =
    typeof params_.hide_unlisted !== "undefined"
      ? params_.hide_unlisted
      : false;
  this.HIDE_REBLOG =
    typeof params_.hide_reblog !== "undefined" ? params_.hide_reblog : false;
  this.HIDE_REPLIES =
    typeof params_.hide_replies !== "undefined" ? params_.hide_replies : false;
  this.HIDE_VIDEO_PREVIEW =
    typeof params_.hide_video_preview !== "undefined"
      ? params_.hide_video_preview
      : false;
  this.HIDE_PREVIEW_LINK =
    typeof params_.hide_preview_link !== "undefined"
      ? params_.hide_preview_link
      : false;
  this.HIDE_EMOJOS =
    typeof params_.hide_emojos !== "undefined" ? params_.hide_emojos : false;
  this.MARKDOWN_BLOCKQUOTE =
    typeof params_.markdown_blockquote !== "undefined"
      ? params_.markdown_blockquote
      : false;
  this.HIDE_COUNTER_BAR =
    params_.hide_counter_bar !== "undefined" ? params_.hide_counter_bar : false;
  this.TEXT_MAX_LINES = params_.text_max_lines || "0";
  this.LINK_SEE_MORE = params_.link_see_more;
  this.FETCHED_DATA = {};

  this.buildTimeline();
};

/**
 * Trigger functions and construct timeline
 */
MastodonApi.prototype.buildTimeline = async function () {
  // Apply color theme
  this.setTheme();

  // Get server data
  await this.getTimelineData();

  // 2024.02.28 Merge pinned posts with timeline posts
  let posts;
  if (
    !this.hidePinnedPosts
    // &&
    // this.pinned.length !== 0
  ) {
    const pinnedPosts = this.FETCHED_DATA.pinned.map((obj) => ({
      ...obj,
      pinned: true,
    }));
    posts = [...pinnedPosts, ...this.FETCHED_DATA.timeline];
  } else {
    posts = this.FETCHED_DATA.timeline;
  }
  
  // Empty the <div> container
  this.CONTAINER_BODY_ID.innerHTML = "";

  for (let i in posts) {
    // First filter (Public / Unlisted)
    if (
      posts[i].visibility == "public" ||
      (!this.HIDE_UNLISTED &&
        posts[i].visibility == "unlisted")
    ) {
      // Second filter (Reblog / Replies)
      if (
        (this.HIDE_REBLOG && posts[i].reblog) ||
        (this.HIDE_REPLIES && posts[i].in_reply_to_id)
      ) {
        // Nothing here (Don't append posts)
      } else {
        // Append posts
        this.appendpost(posts[i], Number(i));
      }
    }
  }

  // Check if there are posts in the container (due to filters applied)
  if (this.CONTAINER_BODY_ID.innerHTML === "") {
    this.CONTAINER_BODY_ID.setAttribute("role", "none");
    this.CONTAINER_BODY_ID.innerHTML =
      '<div class="mt-error"><span class="mt-error-icon">📭</span><br/><strong>Sorry, no posts to show</strong><br/><div class="mt-error-message">Got ' +
      this.FETCHED_DATA.timeline.length +
      " posts from the server. <br/>This may be due to an incorrect configuration in the parameters or to filters applied to hide certains type of posts.</div></div>";
  } else {
    // Insert link after last post to visit Mastodon page
    if (this.LINK_SEE_MORE) {
      let linkSeeMorePath = "";
      if (this.TIMELINE_TYPE === "profile") {
        linkSeeMorePath = this.PROFILE_NAME;
      } else if (this.TIMELINE_TYPE === "hashtag") {
        linkSeeMorePath = "tags/" + this.HASHTAG_NAME;
      } else if (this.TIMELINE_TYPE === "local") {
//         linkSeeMorePath = "public/local";
		linkSeeMorePath = "@Aubrie"
      }
      const linkSeeMore =
        '<div class="mt-footer"><a href="' +
        this.INSTANCE_URL +
        "/" +
        this.escapeHtml(linkSeeMorePath) +
        '" target="_blank" rel="nofollow noopener noreferrer">' +
        this.LINK_SEE_MORE +
        "</a></div>";
      this.CONTAINER_BODY_ID.parentNode.insertAdjacentHTML(
        "beforeend",
        linkSeeMore
      );
    }

    // Control loading spinners
    this.manageSpinner();
  }

  // post interactions
  this.CONTAINER_BODY_ID.addEventListener("click", function (e) {
    // Check if post cointainer was clicked
    if (
      e.target.localName == "article" ||
      e.target.offsetParent?.localName == "article" ||
      (e.target.localName == "img" &&
        !e.target.parentNode.classList.contains("video-ratio14_7"))
    ) {
      openpostURL(e);
    }
    // Check if Show More/Less button was clicked
    if (e.target.localName == "button" && e.target.className == "spoiler-btn") {
      toogleSpoiler(e);
    }
    // Check if video preview image or play icon/button was clicked
    if (
      e.target.className == "mt-post-media-play-icon" ||
      (e.target.localName == "svg" &&
        e.target.parentNode.className == "mt-post-media-play-icon") ||
      (e.target.localName == "path" &&
        e.target.parentNode.parentNode.className ==
          "mt-post-media-play-icon") ||
      (e.target.localName == "img" &&
        e.target.parentNode.classList.contains("video-ratio14_7"))
    ) {
      loadpostVideo(e);
    }
  });
  this.CONTAINER_BODY_ID.addEventListener("keydown", function (e) {
    // Check if Enter key was pressed with focus in an article
    if (e.key === "Enter" && e.target.localName == "article") {
      openpostURL(e);
    }
  });

  /**
   * Open post in a new page avoiding any other natural link
   * @param {event} e User interaction trigger
   */
  const openpostURL = function (e) {
    const urlpost = e.target.closest(".mt-post").dataset.location;
    if (
      e.target.localName !== "a" &&
      e.target.localName !== "span" &&
      e.target.localName !== "button" &&
      e.target.localName !== "time" &&
      e.target.className !== "mt-post-preview-noImage" &&
      e.target.parentNode.className !== "mt-post-avatar-image-big" &&
      e.target.parentNode.className !== "mt-post-avatar-image-small" &&
      e.target.parentNode.className !== "mt-post-preview-image" &&
      e.target.parentNode.className !== "mt-post-preview" &&
      urlpost
    ) {
      window.open(urlpost, "_blank", "noopener");
    }
  };

  /**
   * Spoiler button
   * @param {event} e User interaction trigger
   */
  const toogleSpoiler = function (e) {
    const nextSibling = e.target.nextSibling;
    if (
      nextSibling.localName === "img" ||
      nextSibling.localName === "audio" ||
      nextSibling.localName === "video"
    ) {
      e.target.parentNode.classList.remove("mt-post-media-spoiler");
      e.target.style.display = "none";
    } else if (
      nextSibling.classList.contains("spoiler-text-hidden") ||
      nextSibling.classList.contains("spoiler-text-visible")
    ) {
      if (e.target.textContent == "Show more") {
        nextSibling.classList.remove("spoiler-text-hidden");
        nextSibling.classList.add("spoiler-text-visible");
        e.target.setAttribute("aria-expanded", "true");
        e.target.textContent = "Show less";
      } else {
        nextSibling.classList.remove("spoiler-text-visible");
        nextSibling.classList.add("spoiler-text-hidden");
        e.target.setAttribute("aria-expanded", "false");
        e.target.textContent = "Show more";
      }
    }
  };

  /**
   * Replace the video preview image by the video player
   * @param {event} e User interaction trigger
   */
  const loadpostVideo = function (e) {
    const parentNode = e.target.closest("[data-video-url]");
    const videoURL = parentNode.dataset.videoUrl;
    parentNode.replaceChildren();
    parentNode.innerHTML =
      '<video controls src="' + videoURL + '" autoplay></video>';
  };
};

/**
 * Set the theme style chosen by the user or by the browser/OS
 */
MastodonApi.prototype.setTheme = function () {
  /**
   * Set the theme value in the <html> tag using the attribute "data-theme"
   * @param {string} theme Type of theme to apply: dark or light
   */
  const setTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  };

  if (this.DEFAULT_THEME === "auto") {
    let systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    systemTheme.matches ? setTheme("dark") : setTheme("light");
    // Update the theme if user change browser/OS preference
    systemTheme.addEventListener("change", (e) => {
      e.matches ? setTheme("dark") : setTheme("light");
    });
  } else {
    setTheme(this.DEFAULT_THEME);
  }
};

/**
 * Requests to the server to get all the data
 */
MastodonApi.prototype.getTimelineData = async function () {
  return new Promise((resolve, reject) => {
    /**
     * Fetch data from server
     * @param {string} url address to fetch
     * @returns {object} List of objects
     */
    async function fetchData(url) {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch the following URL: " +
            url +
            "<hr>" +
            "Error status: " +
            response.status +
            "<hr>" +
            "Error message: " +
            response.statusText
        );
      }

      const data = await response.json();
      console.log("data");      
      console.log(data);
      return data;
    }

    // URLs to fetch
    let urls = {};
    if (this.TIMELINE_TYPE === "profile") {
      urls.timeline = `${this.INSTANCE_URL}/api/v1/accounts/${this.USER_ID}/statuses?limit=${this.postS_LIMIT}`;

      console.log("test profile");
      console.log(urls.timeline);
    } else if (this.TIMELINE_TYPE === "hashtag") {
      urls.timeline = `${this.INSTANCE_URL}/api/v1/timelines/tag/${this.HASHTAG_NAME}?limit=${this.postS_LIMIT}`;
    } else if (this.TIMELINE_TYPE === "local") {
      urls.timeline = `${this.INSTANCE_URL}/api/v1/timelines/public?local=true&limit=${this.postS_LIMIT}`;
      if (!this.hidePinnedPosts) {
        urls.pinned = `${this.INSTANCE_URL}/api/v1/accounts/${this.USER_ID}/statuses?pinned=true`;
      }
      
      console.log("urls");
      console.log(urls);
      
      console.log("urls.timeline");
      console.log(urls.timeline);
    }
    if (!this.HIDE_EMOJOS) {
      urls.emojos = this.INSTANCE_URL + "/api/v1/custom_emojis";
    }
    
    // pinned post
    let pinnedURL = {};
    pinnedURL.post = `https://verse.aubrielee.com/api/v1/statuses/109855701678446647`;
      console.log("pinnedURL");
      console.log(pinnedURL.post);

    const urlsPromises = Object.entries(urls).map(([key, url]) => {
      return fetchData(url)
        .then((data) => ({ [key]: data }))
        .catch((error) => {
          reject(new Error("Something went wrong fetching data"));
          this.CONTAINER_BODY_ID.innerHTML =
            '<div class="mt-error"><span class="mt-error-icon">❌</span><br/><strong>Sorry, request failed:</strong><br/><div class="mt-error-message">' +
            error.message +
            "</div></div>";
          this.CONTAINER_BODY_ID.setAttribute("role", "none");
          return { [key]: [] };
        });
    });

      console.log("urlsPromises");
      console.log(urlsPromises);
    console.log(urlsPromises[0]);
    console.log(urlsPromises.Promise);    
          
    const pinnedUrlPromises = Object.entries(pinnedURL).map(([key, pinnedUrl]) => {
      return fetchData(pinnedUrl)
        .then((data) => ({ [key]: data }))
        .catch((error) => {
          reject(new Error("Something went wrong fetching data"));
          this.CONTAINER_BODY_ID.innerHTML =
            '<div class="mt-error"><span class="mt-error-icon">❌</span><br/><strong>Sorry, request failed:</strong><br/><div class="mt-error-message">' +
            error.message +
            "</div></div>";
          this.CONTAINER_BODY_ID.setAttribute("role", "none");
          return { [key]: [] };
        });
    });

      console.log("pinnedUrlPromises");
      console.log(pinnedUrlPromises);

// 	const combinedUrlsPromises = pinnedUrlPromises[0].concat(urlsPromises[0]);
//       console.log("combinedUrlsPromises");
//       console.log(combinedUrlsPromises);

    // Fetch all urls simultaneously
    Promise.all(urlsPromises).then((dataObjects) => {
      this.FETCHED_DATA = dataObjects.reduce((result, dataItem) => {
        return { ...result, ...dataItem };
      }, {});

      console.log("Timeline data fetched: ", this.FETCHED_DATA);
      
		console.log("FETCHED_DATA");
		console.log(this.FETCHED_DATA);
		console.log(this.FETCHED_DATA.timeline);
		
// 		this.FETCHED_DATA.timeline.unshift
// 		console.log(dataObjects);
// 		console.log(dataObjects[0]);
// 		console.log(dataObjects[0].timeline);
      
      resolve();
    });

    
  });
};

/**
 * Inner function to add each post in timeline container
 * @param {object} c post content
 * @param {number} i Index of post
 */
MastodonApi.prototype.appendpost = function (c, i) {
  this.CONTAINER_BODY_ID.insertAdjacentHTML(
    "beforeend",
    this.assamblepost(c, i)
  );
};

/**
 * Build post structure
 * @param {object} c post content
 * @param {number} i Index of post
 */
MastodonApi.prototype.assamblepost = function (c, i) {
  let avatar,
    user,
    userName,
    displayAddress, // AL added
    nameBadge, // AL added
    url,
    date,
    formattedDate,
    favoritesCount,
    reblogCount,
    repliesCount;
    
//     displayAddress = 
//       '<span class="mt-post-header-displayAddress">' +
//       '@Aubrie@aubrielee.com' +
//       '</span>';

  if (c.reblog) {
    // BOOSTED post
    // post url
    url = c.reblog.url;

    // Boosted avatar
    avatar =
      '<a href="' +
      c.reblog.account.url +
      '" class="mt-post-avatar" rel="nofollow noopener noreferrer" target="_blank">' +
      '<div class="mt-post-avatar-boosted">' +
      '<div class="mt-post-avatar-image-big loading-spinner">' +
      '<img src="' +
      c.reblog.account.avatar +
      '" alt="' +
      this.escapeHtml(c.reblog.account.username) +
      ' avatar" loading="lazy" />' +
      "</div>" +
      '<div class="mt-post-avatar-image-small">' +
      '<img src="' +
      c.account.avatar +
      '" alt="' +
      this.escapeHtml(c.account.username) +
      ' avatar" loading="lazy" />' +
      "</div>" +
      "</div>" +
      "</a>";

    // User name and url
    userName = this.showEmojos(
      c.reblog.account.display_name
        ? c.reblog.account.display_name
        : c.reblog.account.username,
      this.FETCHED_DATA.emojos
    );
    user =
      '<div class="mt-post-header-user">' +
      '<a href="' +
      c.reblog.account.url +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      userName +
      '<span class="visually-hidden"> account</span>' +
      "</a>" +
      "</div>";
      
    // Date
    date = c.reblog.created_at;

    // Counter bar
    repliesCount = c.reblog.replies_count;
    reblogCount = c.reblog.reblogs_count;
    favoritesCount = c.reblog.favourites_count;
  } else {
    // STANDARD post
    // post url
    url = c.url;

    // Avatar
    avatar =
      '<a href="' +
      c.account.url +
      '" class="mt-post-avatar" rel="nofollow noopener noreferrer" target="_blank">' +
      '<div class="mt-post-avatar-standard">' +
      '<div class="mt-post-avatar-image-big loading-spinner">' +
      '<img src="' +
      c.account.avatar +
      '" alt="' +
      this.escapeHtml(c.account.username) +
      ' avatar" loading="lazy" />' +
      "</div>" +
      "</div>" +
      "</a>";

    // User name and url
    userName = this.showEmojos(
      c.account.display_name ? c.account.display_name : c.account.username,
      this.FETCHED_DATA.emojos
    );
//     user =
//       '<div class="mt-post-header-user">' +
//       '<a href="' +
//       c.account.url +
//       '" rel="nofollow noopener noreferrer" target="_blank">' +
//       userName +
//       '<span class="visually-hidden"> account</span>' +
//       "</a>" +
//       "</div>";
    
    nameBadge =
      '<div class="mt-post-header-user">' +
      '<div class="mt-post-header-name">' +
      '<a href="' +
      c.account.url +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      userName +
      "</a>" +
      '</div>' +
      '<span class="mt-post-header-displayAddress">' +
      '@Aubrie@aubrielee.com' +
      '</span>' +
      "</div>";      


    // Date
    date = c.created_at;

    // Counter bar
    repliesCount = c.replies_count;
    reblogCount = c.reblogs_count;
    favoritesCount = c.favourites_count;
  }

  // Date
  formattedDate = this.formatDate(date);
  const timestamp =
    '<div class="mt-post-header-date">' +
    (c.pinned
      ? '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="mt-post-pinned" aria-hidden="true"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"></path></svg><span class="mt-pinnedLabel">Pinned</span>'
      // ? '<i class="fa fa-thumb-tack status__prepend-icon fa-fw"></i></svg><span class="mt-pinnedLabel">Pinned</span>'
      : "") +
  
    '<a href="' +
    url +
    '" rel="nofollow noopener noreferrer" target="_blank">' +
    '<time datetime="' +
    date +
    '">' +
    formattedDate +
    "</time>" +
    "</a>" +
    "</div>";

  // Main text
  let text_css = "";
  if (this.TEXT_MAX_LINES !== "0") {
    text_css = " truncate";
    document.documentElement.style.setProperty(
      "--text-max-lines",
      this.TEXT_MAX_LINES
    );
  }

  let content = "";
  if (c.spoiler_text !== "") {
    content =
      '<div class="mt-post-text">' +
      c.spoiler_text +
      ' <button type="button" class="spoiler-btn" aria-expanded="false">Show more</button>' +
      '<div class="spoiler-text-hidden">' +
      this.formatpostText(c.content) +
      "</div>" +
      "</div>";
  } else if (
    c.reblog &&
    c.reblog.content !== "" &&
    c.reblog.spoiler_text !== ""
  ) {
    content =
      '<div class="mt-post-text">' +
      c.reblog.spoiler_text +
      ' <button type="button" class="spoiler-btn" aria-expanded="false">Show more</button>' +
      '<div class="spoiler-text-hidden">' +
      this.formatpostText(c.reblog.content) +
      "</div>" +
      "</div>";
  } else if (
    c.reblog &&
    c.reblog.content !== "" &&
    c.reblog.spoiler_text === ""
  ) {
    content =
      '<div class="mt-post-text' +
      text_css +
      '">' +
      '<div class="mt-post-text-wrapper">' +
      this.formatpostText(c.reblog.content) +
      "</div>" +
      "</div>";
  } else {
    content =
      '<div class="mt-post-text' +
      text_css +
      '">' +
      '<div class="mt-post-text-wrapper">' +
      this.formatpostText(c.content) +
      "</div>" +
      "</div>";
  }

  // Media attachments
  let media = [];
  if (c.media_attachments.length > 0) {
    for (let i in c.media_attachments) {
      media.push(this.placeMedias(c.media_attachments[i], c.sensitive));
    }
  }
  if (c.reblog && c.reblog.media_attachments.length > 0) {
    for (let i in c.reblog.media_attachments) {
      media.push(
        this.placeMedias(c.reblog.media_attachments[i], c.reblog.sensitive)
      );
    }
  }

  // Preview link
  let previewLink = "";
  if (!this.HIDE_PREVIEW_LINK && c.card) {
    previewLink = this.placePreviewLink(c.card);
  }

  // Poll
  let poll = "";
  if (c.poll) {
    let pollOption = "";
    for (let i in c.poll.options) {
      pollOption += "<li>" + c.poll.options[i].title + "</li>";
    }
    poll =
      '<div class="mt-post-poll ' +
      (c.poll.expired ? "mt-post-poll-expired" : "") +
      '">' +
      "<ul>" +
      pollOption +
      "</ul>" +
      "</div>";
  }

  // Counter bar
  let counterBar = "";
  if (!this.HIDE_COUNTER_BAR) {
    const repliesTag =
      '<div class="mt-post-counter-bar-replies">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" aria-hidden="true"><path d="M774.913-185.869V-356q0-56.609-35.891-92.5-35.892-35.891-92.5-35.891H258.045L411.435-331l-56 56.566L105.869-524l249.566-249.566 56 56.566-153.39 153.391h388.477q88.957 0 148.566 59.609 59.608 59.609 59.608 148v170.131h-79.783Z"></path></svg>' +
      repliesCount +
      "</div>";

    const reblogTag =
      '<div class="mt-post-counter-bar-reblog">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" aria-hidden="true"><path d="M276.043-65.304 105.869-236.043l170.174-170.175 52.74 54.175-78.652 78.652h449.304v-160h75.261v235.261H250.131l78.652 78.087-52.74 54.74Zm-90.174-457.348v-235.261h524.565L631.782-836l52.74-54.74L854.696-720 684.522-549.26 631.782-604l78.652-78.652H261.13v160h-75.261Z"></path></svg>' +
      reblogCount +
      "</div>";

    const favoritesTag =
      '<div class="mt-post-counter-bar-favorites">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" aria-hidden="true"><path d="m330.955-216.328 149.066-89 149.066 90.023-40.305-168.391 131.217-114.347-172.956-14.87L480-671.869l-67.043 158.521-172.956 14.305 131.427 113.796-40.473 168.919ZM212.086-50.608l70.652-305.305L45.52-561.305l312.645-26.579L480-876.176l121.835 288.292 312.645 26.579-237.218 205.392 71.217 305.306L480-213.173 212.086-50.607ZM480-433.87Z"></path></svg>' +
      favoritesCount +
      "</div>";

    counterBar =
      '<div class="mt-post-counter-bar">' +
      repliesTag +
      reblogTag +
      favoritesTag +
      "</div>";
  }

  // Add all to main post container
  const post =
    '<article class="mt-post" aria-posinset="' +
    (i + 1) +
    '" aria-setsize="' +
    this.postS_LIMIT +
    '" data-location="' +
    url +
    '" tabindex="0">' +
    '<div class="mt-post-header">' +
    avatar +
//     user +
	nameBadge + // AL added
    timestamp +
    "</div>" +
    content +
    media.join("") +
    previewLink +
    poll +
    counterBar +
    "</article>";

  return post;
};

/**
 * Handle text changes made to posts
 * @param {string} c Text content
 * @returns {string} Text content modified
 */
MastodonApi.prototype.formatpostText = function (c) {
  let content = c;

  // Format hashtags and mentions
  content = this.addTarget2hashtagMention(content);

  // Convert emojos shortcode into images
  if (!this.HIDE_EMOJOS) {
    content = this.showEmojos(content, this.FETCHED_DATA.emojos);
  }

  // Convert markdown styles into HTML
  if (this.MARKDOWN_BLOCKQUOTE) {
    content = this.replaceHTMLtag(
      content,
      "<p>&gt;",
      "</p>",
      "<blockquote><p>",
      "</p></blockquote>"
    );
  }

  return content;
};

/**
 * Add target="_blank" to all #hashtags and @mentions in the post
 * @param {string} c Text content
 * @returns {string} Text content modified
 */
MastodonApi.prototype.addTarget2hashtagMention = function (c) {
  let content = c.replaceAll('rel="tag"', 'rel="tag" target="_blank"');
  content = content.replaceAll(
    'class="u-url mention"',
    'class="u-url mention" target="_blank"'
  );

  return content;
};

/**
 * Find all custom emojis shortcode and replace by image
 * @param {string} c Text content
 * @param {array} e List with all custom emojis
 * @returns {string} Text content modified
 */
MastodonApi.prototype.showEmojos = function (c, e) {
  if (c.includes(":")) {
    for (const emojo of e) {
      const regex = new RegExp(`\\:${emojo.shortcode}\\:`, "g");
      c = c.replace(
        regex,
        `<img src="${emojo.url}" class="custom-emoji" alt="Emoji ${emojo.shortcode}" />`
      );
    }

    return c;
  } else {
    return c;
  }
};

/**
 * Find all start/end <tags> and replace them by another start/end <tags>
 * @param {string} c Text content
 * @param {string} initialTagOpen Start HTML tag to replace
 * @param {string} initialTagClose End HTML tag to replace
 * @param {string} replacedTagOpen New start HTML tag
 * @param {string} replacedTagClose New end HTML tag
 * @returns {string} Text in HTML format
 */
MastodonApi.prototype.replaceHTMLtag = function (
  c,
  initialTagOpen,
  initialTagClose,
  replacedTagOpen,
  replacedTagClose
) {
  if (c.includes(initialTagOpen)) {
    const regex = new RegExp(initialTagOpen + "(.*?)" + initialTagClose, "gi");

    return c.replace(regex, replacedTagOpen + "$1" + replacedTagClose);
  } else {
    return c;
  }
};

/**
 * Place media
 * @param {object} m Media content
 * @param {boolean} s Spoiler/Sensitive status
 * @returns {string} Media in HTML format
 */
MastodonApi.prototype.placeMedias = function (m, s) {
  const spoiler = s || false;
  const type = m.type;
  let media = "";

  if (type === "image") {
    media =
      '<div class="mt-post-media img-ratio14_7 ' +
      (spoiler ? "mt-post-media-spoiler " : "") +
      this.SPINNER_CLASS +
      '">' +
      (spoiler ? '<button class="spoiler-btn">Show content</button>' : "") +
      '<img src="' +
      m.preview_url +
      '" alt="' +
      (m.description ? this.escapeHtml(m.description) : "") +
      '" loading="lazy" />' +
      "</div>";
  }

  if (type === "audio") {
    if (m.preview_url) {
      media =
        '<div class="mt-post-media img-ratio14_7 ' +
        (spoiler ? "mt-post-media-spoiler " : "") +
        this.SPINNER_CLASS +
        '">' +
        (spoiler ? '<button class="spoiler-btn">Show content</button>' : "") +
        '<audio controls src="' +
        m.url +
        '"></audio>' +
        '<img src="' +
        m.preview_url +
        '" alt="' +
        (m.description ? this.escapeHtml(m.description) : "") +
        '" loading="lazy" />' +
        "</div>";
    } else {
      media =
        '<div class="mt-post-media ' +
        (spoiler ? "mt-post-media-spoiler " : "") +
        '">' +
        (spoiler ? '<button class="spoiler-btn">Show content</button>' : "") +
        '<audio controls src="' +
        m.url +
        '"></audio>' +
        "</div>";
    }
  }

  if (type === "video") {
    if (!this.HIDE_VIDEO_PREVIEW) {
      media =
        '<div class="mt-post-media video-ratio14_7 ' +
        (spoiler ? "mt-post-media-spoiler " : "") +
        this.SPINNER_CLASS +
        '" data-video-url="' +
        m.url +
        '">' +
        (spoiler ? '<button class="spoiler-btn">Show content</button>' : "") +
        '<img src="' +
        m.preview_url +
        '" alt="' +
        (m.description ? this.escapeHtml(m.description) : "") +
        '" loading="lazy" />' +
        '<button class="mt-post-media-play-icon" title="Load video"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14"><path d="M9.5 7l-9 6.3V.7z"/></svg></button>' +
        "</div>";
    } else {
      media =
        '<div class="mt-post-media video-ratio14_7 ' +
        (spoiler ? "mt-post-media-spoiler " : "") +
        '">' +
        (spoiler ? '<button class="spoiler-btn">Show content</button>' : "") +
        '<video controls src="' +
        m.url +
        '"></video>' +
        "</div>";
    }
  }

  return media;
};

/**
 * Place preview link
 * @param {object} c Preview link content
 * @returns {string} Preview link in HTML format
 */
MastodonApi.prototype.placePreviewLink = function (c) {
  const card =
    '<a href="' +
    c.url +
    '" class="mt-post-preview" target="_blank" rel="noopener noreferrer">' +
    (c.image
      ? '<div class="mt-post-preview-image ' +
        this.SPINNER_CLASS +
        '"><img src="' +
        c.image +
        '" alt="' +
        this.escapeHtml(c.image_description) +
        '" loading="lazy" /></div>'
      : '<div class="mt-post-preview-noImage">📄</div>') +
    "</div>" +
    '<div class="mt-post-preview-content">' +
    (c.provider_name
      ? '<span class="mt-post-preview-provider">' +
        this.parseHTMLstring(c.provider_name) +
        "</span>"
      : "") +
    '<span class="mt-post-preview-title">' +
    c.title +
    "</span>" +
    (c.author_name
      ? '<span class="mt-post-preview-author">' +
        this.parseHTMLstring(c.author_name) +
        "</span>"
      : "") +
    "</div>" +
    "</a>";

  return card;
};

/**
 * Format date
 * @param {string} d Date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @returns {string} Date formated (MM DD, YYYY)
 */
MastodonApi.prototype.formatDate = function (d) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const date = new Date(d);

  const displayDate =
    date.getFullYear() +
    "." +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "." +
    ("0" + date.getDate()).slice(-2);

  return displayDate;
};

/**
 * Parse HTML string
 * @param {string} s HTML string
 * @returns {string} Plain text
 */
MastodonApi.prototype.parseHTMLstring = function (s) {
  const parser = new DOMParser();
  const txt = parser.parseFromString(s, "text/html");
  return txt.body.textContent;
};

/**
 * Escape quotes and other special characters, to make them safe to add
 * to HTML content and attributes as plain text
 * @param {string} s String
 * @returns {string} String
 */
MastodonApi.prototype.escapeHtml = function (s) {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

/**
 * Add/Remove event listener for loading spinner
 */
MastodonApi.prototype.manageSpinner = function () {
  // Remove CSS class to container and listener to images
  const spinnerCSS = this.SPINNER_CLASS;
  const removeSpinner = function () {
    this.parentNode.classList.remove(spinnerCSS);
    this.removeEventListener("load", removeSpinner);
    this.removeEventListener("error", removeSpinner);
  };

  // Add listener to images
  this.CONTAINER_BODY_ID.querySelectorAll(
    `.${this.SPINNER_CLASS} > img`
  ).forEach((e) => {
    e.addEventListener("load", removeSpinner);
    e.addEventListener("error", removeSpinner);
  });
};
