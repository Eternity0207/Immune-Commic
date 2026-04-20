import fs from "fs";
import path from "path";
import sharp from "sharp";

const folder = ".";

fs.readdirSync(folder).forEach(file => {
    if (file.toLowerCase().endsWith(".png")) {
        const input = path.join(folder, file);
        const output = path.join(folder, file.replace(".png", ".jpeg"));

        sharp(input)
            .jpeg({ quality: 60 })
            .toFile(output)
            .then(() => console.log("Converted:", file))
            .catch(err => console.error(err));
    }
});