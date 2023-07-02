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
      ${favStar(currentUser, story.storyId)}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
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
  console.log(author, title, url);
  const story = await storyList.addStory(currentUser, {
    title,
    author,
    url,
  });
  $("#story-form").hide(700);
  $("#all-stories-list").prepend(generateStoryMarkup(story));
});

$(".stories-container").on("click", async (evt) => {
  const storyId = $(evt.target).parent()[0].id;
  if (evt.target.tagName === "I") {
    $(evt.target).toggleClass("fas far");

    if ($(evt.target)[0].classList[1] === "fas") {
      await axios.post(
        `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
        {
          token: currentUser.loginToken,
        }
      );
    } else {
      await axios.delete(
        `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
        {
          data: { token: currentUser.loginToken },
        }
      );
    }
  }
});

function favStar(user, storyId) {
  if (user) {
    for (let story of user.favorites) {
      if (story.storyId === storyId) return '<i class="fa-star fas"></i>';
    }
    return '<i class="fa-star far"></i>';
  } else {
    return "";
  }
}
