import fs from "fs";
import path from "path";

export const rules = {
  "no-missing-styles": {
    meta: {
      type: "problem",
      docs: {
        description: "Ensure all classes in Style.module.css exist in other Style#.module.css files.",
      },
      schema: [],
      messages: {
        missingClass: "Class '.{{className}}' from Style1.module.css is missing in {{fileName}}.",
        SeeingFile: "Checking file {{fileName}} for missing classes...",
      }
    },
    create(context) {
      const baseFile = path.resolve("src/styles/Style1.module.css");
      const otherFiles = [
        "src/styles/Style2.module.css"
      ].map(f => path.resolve(f));

      if (!fs.existsSync(baseFile)) {
        return {}; // Skip rule if the base file is missing
      }

      const baseClasses = extractClasses(baseFile);
      const checkedFiles = new Set(); // ✅ Prevent duplicate linting

      return {
        Program(node) {
          otherFiles.forEach((file) => {
            context.report({
                node,
                messageId: "SeeingFile",
                data: { fileName: path.basename(file) },
            });
            if (!fs.existsSync(file) || checkedFiles.has(file)) return; // ✅ Skip if already checked

            checkedFiles.add(file);
            const fileClasses = extractClasses(file);
            const missingClasses = [...baseClasses].filter(
              (cls) => !fileClasses.has(cls)
            );

            missingClasses.forEach((cls) => {
              context.report({
                node,
                messageId: "missingClass",
                data: { className: cls, fileName: path.basename(file) },
              });
            });
          });
        }
      };
    }
  }
};

function extractClasses(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const matches = content.match(/\.[a-zA-Z0-9_-]+/g) || [];
  return new Set(matches.map((cls) => cls.substring(1))); // Remove leading `.`
}
