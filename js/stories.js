"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
  
      <li id="${story.storyId}">
      <div class='story'>
  <div >
     <span class='star'> ${favStar(currentUser, story.storyId)} </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>  <small class="story-hostname">(${hostName})</small>
      </div>
        <div class='story-author-user'> 
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
        </div>
      </li>
      <hr>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

$("#story-form").on("submit", async (evt) => {
  evt.preventDefault();
  const title = $("input[name ='title']").val();
  const author = $("input[name ='author']").val();
  const url = $("input[name ='url']").val();
  const story = await storyList.addStory(currentUser, {
    title,
    author,
    url,
  });
  $("#story-form").hide(700);
  $("#all-stories-list").prepend(generateStoryMarkup(story));
  $("input[name ='title']").val("");
  $("input[name ='author']").val("");
  $("input[name ='url']").val("");
});

$(".stories-container").on("click", async (evt) => {
  const storyId = $(evt.target).attr("storyId");
  if (evt.target.tagName === "I") {
    $(evt.target).toggleClass("fas far");

    $(evt.target)[0].classList[1] === "fas"
      ? await currentUser.addFavorites(storyId)
      : await currentUser.removeFavorites(storyId);
  }
});

function favStar(user, storyId) {
  if (user) {
    for (let story of user.favorites) {
      if (story.storyId === storyId)
        return `<i class="fa-star fas" storyId= ${story.storyId}></i>`;
    }
    return `<i class="fa-star far" storyId=${storyId}></i>`;
  } else {
    return "";
  }
}

$("#favorites-stories").on("click", () => {
  $($allStoriesList).children().remove();
  $storyForm.hide();

  if (currentUser.favorites.length === 0) {
    $h5.text("No favorites added!");
    $h5.show();
    return;
  }
  $h5.hide();
  const favStoryIds = currentUser.favorites.map((story) => story.storyId);
  const favStory = storyList.stories.filter((story) =>
    favStoryIds.includes(story.storyId)
  );

  for (let story of favStory) {
    $(generateStoryMarkup(story)).appendTo($allStoriesList);
  }
});

$(".stories-container").on("click", async (evt) => {
  const storyId = $(evt.target).attr("storyId");
  if (evt.target.tagName === "D") {
    await axios.delete(`${BASE_URL}/stories/${storyId}`, {
      data: { token: currentUser.loginToken },
    });
    $(`#${storyId}`).hide(400);
    storyList.stories = storyList.stories.filter(
      (story) => story.storyId != storyId
    );
    currentUser.ownStories = currentUser.ownStories.filter(
      (story) => story.storyId != storyId
    );
    if (currentUser.ownStories.length === 0) {
      $h5.text("No stories added by user yet!").show(400);
    }
  }
});

$("#my-stories").on("click", () => {
  $($allStoriesList).children().remove();
  $storyForm.hide();
  const h5 = $("h5");

  if (currentUser.ownStories.length === 0) {
    h5.text("No stories added by user yet!");
    h5.show();
    return;
  }
  h5.hide();
  const ownStoryIds = currentUser.ownStories.map((story) => story.storyId);
  const ownStory = storyList.stories.filter((story) =>
    ownStoryIds.includes(story.storyId)
  );

  for (let story of ownStory) {
    $(generateStoryMarkup(story)).appendTo($allStoriesList);
    $(`#${story.storyId}`).prepend(
      `'<d class="fa fa-times delete" aria-hidden="true" storyId=${story.storyId}></d>`
    );
  }
});
