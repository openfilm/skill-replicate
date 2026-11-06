# Replicate a video

A skill for [OpenFilm](https://github.com/openfilm/openfilm): give it a video, and it is made again in OpenFilm with
your own content (your product, footage, face, words or topic) in the same look and the same timing, or frame for
frame. Every part can be edited afterwards.

<img src="skills/replicate/cover.jpg" width="480" alt="">

## Why it measures

An agent sees still pictures, not a video. Looking at frames, it gets the look of a video right and its timing wrong:
it misses cuts between the frames it looked at, moves things at an even pace where the video eases, and keeps its own
clock. So this skill gives the agent a measure of time:

- `measure.mjs study <video>` turns the video into a timeline read to the frame: its cuts; each change, where in the
  frame it happens and how its pace rises and falls; the stretches where it holds still; its sound's hits and beat.
- `measure.mjs compare <reference> <render>` measures the remake against it: every cut, change and hit matched with its
  offset in frames, each change's pace and length, a rhythm score, each shot's palette and layout (which hold when only
  the content changed), how alike the frames are, side-by-side pictures of where they differ most, and what of the reference
  is in the remake: its frames, its sound, a clip from `references/`, runs of its words.

The brief says what the remake must be. Pages make what pages make exactly (text, graphics, interfaces, motion), and
what was filmed stays filmed: the person's footage, or footage a video service makes from the reference's shot.

Both need only Node and ffmpeg, which OpenFilm needs too, and take seconds.

## Use it

- **In OpenFilm**: it comes with it. Pick it in the chat, or ask for a remake of a video.
- **In your own agent** (Claude Code, Codex and others):

  ```sh
  npx skills add openfilm/openfilm
  npx skills add openfilm/skill-replicate
  ```

## This repository

| | |
| --- | --- |
| `skills/replicate/` | the skill: everything in it is what the agent gets |
| `evals/README.md` | the real requests it was tried on, with and without it, and what was measured |
| `CHANGELOG.md` | what changed in each version |

How a skill for OpenFilm is written: [SPEC.md](https://github.com/openfilm/skills/blob/main/SPEC.md).

## License

[MIT](LICENSE).
