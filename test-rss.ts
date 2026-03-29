import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: ["content:encoded", "description", "pubDate"],
  },
});

parser
  .parseURL("https://v2.velog.io/rss/velopert")
  .then((feed) => {
    console.log("Title:", feed.title);
    console.log(`Found ${feed.items.length} items`);
    if (feed.items.length > 0) {
      console.log("Sample item:", feed.items[0].title, feed.items[0].pubDate);
    }
  })
  .catch(console.error);
