I am participating in a vibe coding hackaton.
The goal is to create a cross plateform mobile first (and computer too, so think about responsive) app for agile team.

This is an iteration on the existing app.

- on activity/create and edit page, there is a empty round visible on the top right of the screen, it does nothing but its here, its weird. Clean that up.
- on the home page, remove the "Favorite" carousel, we already have a dedicated page.
- about the articles:
  - ok to show the last 3, but if more, do a redirection button and page to show all articles (see more)
  - from the homepage or the article list, clicking on an article should show the article detail
  - when i have two instances up, one admin update article, i have no way to refresh article list on the other instance, how is it usually handled for that ? Maybe not anything too much complicated (ban websocket), so if easy and usual solution go for it, else we can just refresh page to see the update, but if you have a better idea, we can try it out.
- home page cards: still not very tasty, pretty ugly. Maybe make the card bigger ? Or remove the top border color its  weird. Either do like explorer with left border, or all border.
- BUG: when coming from a icebreaker activity page, and going to home page, it doesnt refresh "Seen recently list", while it does works when coming from retro activity page. why? Fix it.
- big feature: in .env i added GROQ_API_KEY. When creating a retrospective activity, we might want to add a button just below selection of type (retrospective vs icebreaker) to "Generate Retrospective from a theme using AI" thing (not for icebreaker, wouldn't make sense). The user would then have to give his theme (ex: "team communication", "Easter and chocolate" etc) and then we would call groq API to generate the content of the retrospective (think easy, like most of the time, 3 columns, "what went well", "what didn't go well", "what could we do differently/additionally"). We can then pre-fill the form with the generated content, and let the user edit it before saving. It would be a nice way to quickly create a retrospective activity without having to fill everything from scratch, and also to discover new formats of retrospectives that they might not have thought of. Think deeply about best practice about AI integration and pre prompt so this works nicely. I expect you to do some research about AI integration in app so this integrate smoothly. Lets probably go with model llama-3.3-70b-versatile (i have free plan, dont spam too much and too fast i guess). We can also add a "regenerate" button to call the API again and get a different version if the user doesn't like the first one. This is a big feature but it would be really cool and a great showcase of AI integration in our app, so lets do it. If you dont know how to use groq API ask me so i can give you documentation https://console.groq.com/docs/quickstart.

I want you to:
First, understand what you need to do. Understand the project and what we want.
Then, create yourself a full and huge backlog of what you need to do. You can even dedicate a file at root of project repo to keep track if your TODOs API aren't enough.
Lastly, iterate over and over on whats left to do. You can refine and add TODOs as you discover things you need to do. I want you to be as autonomous as possible.

If at any point you are technically blocked (missing a tool on the computer or whatever), you can ask for help, but try to be as specific as possible in your question, and try to do some research on your own before asking.

Git is setup, think of doing focus commits so its easier to detects changes and rollback on issues.
