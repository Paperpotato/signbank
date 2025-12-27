const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const INPUT_DIR = path.resolve("./mp4");
const OUTPUT_DIR = path.resolve("./ogv");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

fs.readdir(INPUT_DIR, (err, files) => {
  if (err) {
    console.error("❌ Failed to read input directory:", err.message);
    process.exit(1);
  }

  const mp4Files = files.filter(f => f.toLowerCase().endsWith(".mp4"));

  if (!mp4Files.length) {
    console.log("⚠️ No MP4 files found.");
    return;
  }

  console.log(`🎬 Found ${mp4Files.length} MP4 file(s)`);

  mp4Files.forEach(file => {
    const inputPath = path.join(INPUT_DIR, file);
    const outputFile = file.replace(/\.mp4$/i, ".ogv");
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    console.log(`➡️ Converting: ${file}`);

    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-c:v", "libtheora",
      "-q:v", "7",
      "-pix_fmt", "yuv420p",
      "-c:a", "libvorbis",
      "-q:a", "5",
      outputPath
    ], {
      stdio: "inherit"
    });

    ffmpeg.on("close", code => {
      if (code === 0) {
        console.log(`✅ Done: ${outputFile}`);
      } else {
        console.error(`❌ Failed (${code}): ${file}`);
      }
    });
  });
});
