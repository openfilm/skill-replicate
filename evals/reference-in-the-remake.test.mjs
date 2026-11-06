// compare's check that none of the reference is in the remake, on videos ffmpeg draws: `node --test evals/*.test.mjs`.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

const MEASURE = join(import.meta.dirname, '../skills/replicate/scripts/measure.mjs');
const dir = mkdtempSync(join(tmpdir(), 'reference-in-the-remake-'));
const at = (/** @type {string} */ name) => join(dir, name);

const ffmpeg = (/** @type {string[]} */ ...args) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args.flat()], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
};
/* a tune stepping every eighth of a second, with its own pitches */
const tune = (/** @type {number} */ k, /** @type {number} */ len) => ['-f', 'lavfi', '-i', `aevalsrc='0.35*sin(2*PI*(220+mod(floor(t*8)*${k},1700))*t)+0.2*sin(2*PI*(500+mod(floor(t*8)*${k + 44},1400))*t):s=44100:d=${len}'`];
const H264 = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-c:a', 'aac', '-shortest'];

/** compare's exit code and what it found. @param {string} remake @param {string[]} [more] */
function leaksOf(remake, more = []) {
  const out = at(`compare-${remake.replace(/\W/g, '-')}`);
  const r = spawnSync('node', [MEASURE, 'compare', at('reference.mp4'), at(remake), '--out', out, ...more], { encoding: 'utf8', cwd: dir });
  assert.ok(r.status === 0 || r.status === 1, r.stderr);
  const { leaks } = JSON.parse(readFileSync(join(out, 'compare.json'), 'utf8'));
  return { code: r.status, leaks, report: readFileSync(join(out, 'compare.md'), 'utf8') };
}

before(() => {
  ffmpeg('-f', 'lavfi', '-i', 'testsrc2=s=1280x720:r=30:d=8', tune(137, 8), H264, at('reference.mp4'));
  /* nothing of the reference: another picture, another tune */
  ffmpeg('-f', 'lavfi', '-i', 'mandelbrot=s=1280x720:r=30:end_scale=0.02,trim=duration=8', tune(211, 8), H264, at('other.mp4'));
  ffmpeg('-f', 'lavfi', '-i', 'mandelbrot=s=640x360:r=30,trim=duration=20', tune(211, 20), H264, at('other-long.mp4'));
  ffmpeg('-i', at('reference.mp4'), '-vf', 'scale=640:360', ...H264, at('smaller.mp4'));
  ffmpeg('-i', at('reference.mp4'), '-vf', 'scale=720:405,pad=720:1280:-1:-1', ...H264, at('fitted.mp4'));
  ffmpeg('-i', at('reference.mp4'), '-vf', 'crop=405:720,scale=720:1280', ...H264, at('cropped.mp4'));
  ffmpeg('-i', at('reference.mp4'), '-vf', 'crop=iw*0.97:ih*0.97:iw*0.03:ih*0.03,scale=1280:720', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', at('shifted.mp4'));
  ffmpeg('-i', at('other-long.mp4'), '-i', at('reference.mp4'), '-filter_complex',
    '[0:v]trim=0:6,setpts=PTS-STARTPTS[a];[1:v]trim=2:6,setpts=PTS-STARTPTS,scale=640:360[b];[0:v]trim=6:12,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0[v]',
    '-map', '[v]', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', at('spliced.mp4'));
  ffmpeg('-i', at('other.mp4'), '-i', at('reference.mp4'), '-filter_complex', '[1:a]volume=-12dB[under];[0:a][under]amix=inputs=2:normalize=0[a]', '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', at('under.mp4'));
});
after(() => rmSync(dir, { recursive: true, force: true }));

test('the reference re-encoded at another size is found in picture and sound', () => {
  const { code, leaks } = leaksOf('smaller.mp4');
  assert.equal(code, 1);
  assert.ok(leaks.pictures[0].to - leaks.pictures[0].from > 7, JSON.stringify(leaks.pictures));
  assert.ok(leaks.sound.length, 'sound');
});

test('the reference fitted with bars or cropped to fill is found', () => {
  for (const remake of ['fitted.mp4', 'cropped.mp4']) {
    const { code, leaks } = leaksOf(remake);
    assert.equal(code, 1, remake);
    assert.ok(leaks.pictures.reduce((s, p) => s + p.to - p.from, 0) > 6, `${remake} ${JSON.stringify(leaks.pictures)}`);
  }
});

test('a stretch of the reference spliced in is found where it plays, and where it came from', () => {
  const { code, leaks } = leaksOf('spliced.mp4');
  assert.equal(code, 1);
  assert.equal(leaks.pictures.length, 1, JSON.stringify(leaks.pictures));
  assert.ok(Math.abs(leaks.pictures[0].from - 6) < 0.2 && Math.abs(leaks.pictures[0].to - 10) < 0.2, JSON.stringify(leaks.pictures));
  assert.ok(Math.abs(leaks.pictures[0].refFrom - 2) < 0.2, JSON.stringify(leaks.pictures));
});

test("the reference's sound 12 dB under another film's is found", () => {
  const { code, leaks } = leaksOf('under.mp4');
  assert.equal(code, 1);
  assert.ok(leaks.sound.length, 'sound');
  assert.equal(leaks.pictures.length, 0);
});

test('a picture 3% off the reference, and a film of something else, are not', () => {
  for (const remake of ['shifted.mp4', 'other.mp4']) {
    const { code, leaks } = leaksOf(remake);
    assert.equal(code, 0, `${remake} ${JSON.stringify(leaks)}`);
    assert.deepEqual([leaks.pictures, leaks.sound, leaks.files], [[], [], []]);
  }
});

/** A project in its own folder: film.html with these clips, and the render inside it. @param {string} name @param {string} body @param {string} render */
function project(name, body, render) {
  const home = at(name);
  mkdirSync(join(home, 'references'), { recursive: true });
  mkdirSync(join(home, 'assets'), { recursive: true });
  copyFileSync(at('reference.mp4'), join(home, 'references/ref.mp4'));
  copyFileSync(at(render), join(home, 'render.mp4'));
  writeFileSync(join(home, 'film.html'), `<!doctype html><html><body>\n${body}\n</body></html>\n`);
  return home;
}
const compareIn = (/** @type {string} */ home) => {
  const out = join(home, 'compare');
  const r = spawnSync('node', [MEASURE, 'compare', join(home, 'references/ref.mp4'), join(home, 'render.mp4'), '--out', out], { encoding: 'utf8', cwd: home });
  assert.ok(r.status === 0 || r.status === 1, r.stderr);
  return { code: r.status, leaks: JSON.parse(readFileSync(join(out, 'compare.json'), 'utf8')).leaks };
};

test('a clip pointing into references/ is found; one commented out, with a quoted ">", is not', () => {
  assert.deepEqual(compareIn(project('plays', '<section><video src="references/ref.mp4#t=0,2" at="1"></video></section>', 'other.mp4')).leaks.files, ['references/ref.mp4']);
  const quiet = compareIn(project('commented', `<!-- <section><video src="references/ref.mp4"></video></section> -->\n<section><iframe src="page.html" overrides='{"a":"b > c"}' at="0"></iframe></section>`, 'other.mp4'));
  assert.deepEqual(quiet.leaks.files, []);
  assert.equal(quiet.code, 0);
});

test('a copy of the reference under another name, and a page that plays it, are found', () => {
  const copied = project('copied', '<section><video src="assets/mine.mp4"></video></section>', 'other.mp4');
  copyFileSync(at('reference.mp4'), join(copied, 'assets/mine.mp4'));
  assert.deepEqual(compareIn(copied).leaks.files, ['assets/mine.mp4']);
  const paged = project('paged', '<section><iframe src="page.html"></iframe></section>', 'other.mp4');
  writeFileSync(join(paged, 'page.html'), '<video src="references/ref.mp4"></video>');
  assert.deepEqual(compareIn(paged).leaks.files, ['page.html']);
});

test('frames that alike with only pages playing are a copy drawn, not a leak; with footage playing, a leak', () => {
  const drawn = compareIn(project('drawn', '<section><iframe src="page.html"></iframe></section>', 'smaller.mp4'));
  assert.deepEqual(drawn.leaks.pictures, []);
  assert.ok(drawn.leaks.drawn.length);
  const shown = compareIn(project('shown', '<section><video src="assets/clip.mp4#t=0,8" at="0"></video></section>', 'smaller.mp4'));
  assert.ok(shown.leaks.pictures.length);
  assert.equal(shown.code, 1);
  const hidden = compareIn(project('hidden', '<section hidden><video src="assets/clip.mp4#t=0,8" at="0"></video></section>', 'smaller.mp4'));
  assert.deepEqual(hidden.leaks.pictures, []);
});

test("runs of the reference's words are told, from its clips' transcripts where they play, muted tracks left out", () => {
  const words = 'the quick brown fox jumps over the lazy dog and runs back home again'.split(' ');
  const vtt = (/** @type {string[]} */ list, /** @type {number} */ from) => `WEBVTT\n\n${list.map((w, i) => `00:00:${String(from + i).padStart(2, '0')}.000 --> 00:00:${String(from + i + 1).padStart(2, '0')}.000\n${w}`).join('\n\n')}\n`;
  const home = project('words', '<section><audio src="assets/voice.wav#t=2,12" at="1" speed="2"></audio></section>\n<section muted><audio src="assets/quiet.wav"></audio></section>', 'other.mp4');
  writeFileSync(join(home, 'references/ref.vtt'), vtt(words, 0));
  writeFileSync(join(home, 'assets/voice.vtt'), vtt(words, 0));
  writeFileSync(join(home, 'assets/quiet.vtt'), vtt('nothing that was ever said in the reference film at all'.split(' '), 0));
  const { leaks } = compareIn(home);
  assert.equal(leaks.words.length, 10);
  assert.equal(leaks.words.run, words.slice(2, 12).join(' '));
  assert.equal(leaks.words.at, 1);
  assert.equal(leaks.words.long, true);
  assert.equal(leaks.words.share, 1);
});

test('without transcripts the words are said to be unmeasured, and the report has its section', () => {
  const { report, leaks } = leaksOf('other.mp4');
  assert.equal(leaks.words, null);
  assert.match(report, /## The reference in the remake/);
  assert.match(report, /words: not measured/);
});
