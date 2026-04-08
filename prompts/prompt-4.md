I am participating in a vibe coding hackaton.
The goal is to create a cross plateform mobile first (and computer too, so think about responsive) app for agile team.

This is an iteration on the existing app.

- replace readme to use pnpm. If possible and if it make sense, also set up pnpm as monorepo 2 modules (if its no use dont do it, your call).
- feat: navigation: when you use "trouve ton booster" and end up on the final activity as a result, when going back with the top arrow, it goes back in the research step by step (from last step etc) -> i would like another way to one-click and go to home page, so i dont have to use the go back multiple time
- about activity creation: make it so, only an admin can create one that is shared accross every user (use env var to define local admin) -- so add a role or a flag to activity to define if its a global or user one -> i still want any user to be able to create an activity, but in this case only the user who created it can see his own activities, additionnaly to the default ones + globally defined ones (probably the same case, only default seed versus added by admin later)
- for any activity, a user can "clone" it to personalize it, so its like creating a user activity but from an existing activity for customization (user scoped only)
- we got some feedback about ui/ux: we have to perfect it. Not sure what that means. Maybe what we did is too basic, not stylish enough. Maybe its too computer centered. But always think responsive and make it works primarly for mobile, but for computer too. Try to get inspiration from pioneer, make a more welcoming app, less technical/dashboard, from a dev. Think UX UI from a designer point of view to make pleasant view. maybe more color, warmer UI, take more space, less empty space. Try to reuse component so changes are applied globally. UI system etc.
- bonus: admin view. As admin, I can: i can write and push articles that will be shown in a dedicated part in the home page for all user (a new table in DB) (like in the original figma input in resources/).

I want you to:
First, understand what you need to do. Understand the project and what we want.
Then, create yourself a full and huge backlog of what you need to do. You can even dedicate a file at root of project repo to keep track if your TODOs API aren't enough.
Lastly, iterate over and over on whats left to do. You can refine and add TODOs as you discover things you need to do. I want you to be as autonomous as possible.

If at any point you are technically blocked (missing a tool on the computer or whatever), you can ask for help, but try to be as specific as possible in your question, and try to do some research on your own before asking.

Git is setup, think of doing focus commits so its easier to detects changes and rollback on issues.
