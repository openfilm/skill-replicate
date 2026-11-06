# Changes

Newest first. Each version is the one in `skills/replicate/openfilm.json`, and is tagged `v<version>`.

## 0.1.3

`compare` says what of the reference is in the remake, and exits 1 when a picture, a sound or a file of it is: its frames
(re-encoded, cropped to fill or fitted with bars), its sound, even under another, a clip pointing into `references/` or a
copy of it, a page that plays it. Runs of its words are told and do not fail it. Frames as alike with only pages playing
are told apart as a copy drawn frame for frame. `evals/reference-in-the-remake.test.mjs` tries each on videos ffmpeg draws.

## 0.1.2

The reference's subject is content. Name first what it shows and sells (whose product, app, brand or story), then show
the person's in its place: their app's own screens, designed as such an app is when they give none, not the reference's
interface renamed or around them; their thing, not the reference's relabelled. How it is shown stays: framing, camera,
type, colour, motion, time. The shot list starts with the reference's subject and the person's. `compare`'s numbers
drop where content changed, as they should. Tried on a software
demo and a product film whose references show their own app: before, the remake kept the reference's editor and put
the person's app inside it.

## 0.1.1

A shot's sound comes with its picture. Who speaks on screen speaks in the picture: lips, voice and captions are one
take, the voice made with the picture or the picture made from the voice, never a voice laid over a clip made without
it. The room, steps and hits a clip makes come with it, and only what runs across cuts (music, a voice off screen) is a
track of its own. A person keeps one face and one voice.
A person made up for the film passes for no real one, not even the reference's people. Tried on a vertical presenter
video, where a voice laid over generated clips had left lips and words apart.

## 0.1.0

The first version, in a repository of its own. A brief whose line is the reference's look and time carrying the
person's content: each part made with what can look like it, their content and no one else's, and the shot list seen
before anything costs. With `measure.mjs`: `study` reads a video's cuts, changes, holds and sound to the frame, and
`compare` measures a remake against it, in time and in each shot's palette and layout.
