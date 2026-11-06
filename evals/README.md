# Evals

How this skill was tried. Nothing here goes to the agent: only `skills/` is installed. The reference videos and the
films stay on the computer they were tried on, since the references are other people's videos.

Each request was given to Codex (gpt-6.1-sol, high) twice, once with the skill and once with an OpenFilm that has no
skills, each in a home of its own, video made only with the cheapest model allowed. Every film was rendered and
measured against its reference with `skills/replicate/scripts/measure.mjs compare`. The skill's agent has that measure
too, so its numbers lean its way: the films were also watched side by side, and that decides.

Numbers: rhythm (how the two films' change over time correlates), changes starting within a frame of the
reference's, layout, and SSIM.

| request (word for word) | skill | with | without | seen |
| --- | --- | --- | --- | --- |
| 照着 references/ref.mp4 的结构、节奏和动效，做一条我自己的：「按下快门之后的 0.1 秒，手机里发生了什么」。30 秒，先不配音、不配乐。 | 0.1.0 | 0.78, 20/25, 0.76, 0.75 | 0.20, 7/25, 0.49, 0.66 | both change the content well; with the skill, states change at the reference's moments |
| 复刻这个视频，要一模一样：references/ref.mp4（30 秒）。画面比例和它一样，配音和音乐也用它的。 | 0.1.0 | 0.92, 19/25, 0.96, 0.92 | imported the reference as the film | without the skill nothing is made again, and nothing can change |
| 做个同款：references/ref.mp4，讲「此刻海上同时有多少艘船」。出镜的人用 AI 生成一个（不要像任何真人），中文男声配音，字幕和原片一样。30 秒，竖屏。 | 0.1.2 | 0.33, 2/24, 0.41, 0.22; cuts 6/9 | -0.06, 2/24, 0.32, 0.12; cuts 0/9 | one clip with its own voice and lips, cut into the reference's shots one by one; both dress the made-up man like the reference's presenter |
| 照着 references/ref.mp4 做一条同款，介绍我的 App「小票记」的「拍小票自动记账」功能：画面结构、节奏、字幕和配音风格都和它一样。我没有录屏，界面你来做。中文配音。30 秒。 | 0.1.2 | 0.81, 18/31, 0.86, 0.49 | 0.27, 5/31, 0.58, 0.31 | 0.1.1 kept the reference's editor around the person's app; once the subject is named first, the app has its own screens in the reference's framing and moves |
| 照着 references/ref.mp4 做个同款，换成我的开源项目 Lumen：一个本地优先、用 Markdown 写的笔记应用，口号是「你的笔记，只在你手里」。32 秒，和它一样不配音。 | 0.1.2 | 0.34, 15/65, 0.96, 0.69 | -0.02, 15/65, 0.17, 0.31 | the person's app still takes the reference's three-column layout, a timeline-like panel and film-like titles; open |

`node --test evals/*.test.mjs` tries `compare`'s check that none of the reference is in the remake, on videos ffmpeg
draws, so anyone can run it again; it needs only Node and ffmpeg, and takes about a minute.
