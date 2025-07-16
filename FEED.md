# The flow of feeding scripts

## 1. Create script data

- create a json file
```
touch src/data/scripts-by-group/my_script_file.json
```

- create data in the file
```
[
  {
    "id": "",
    "englishText": "",
    "japaneseTranslation": "",
    "explanation": ""
  }
]
```

## 2. Add metadata into scriptGroups.json file

src/data/scriptGroups.json
```
{
    "id": "my_script_file", <- match to the json file name("my_script_file".json)
    "title": "",
    "category": "",
    "subCategory": "",
    "details": {
      "series": "",
      "season": ,
      "episode": ,
      "episodeTitle": ""
    },
    "description": ""
}

```

## 3. Give a prompt to fill out all field of data

Prompt
```
@src/data/scripts-by-group/[scripts-file]
の[n]行目から新しいデータが作成されています。
・はじめのID：[id]から次に来るデータが連番になるようにそれぞれのIDを変更してください。
・英語スクリプトを日本語訳したものをjapaneseTranslationの値に記入してください。
・もし、スクリプトに難しい文法やネイティブ表現が使われている場合は解説をつけてください。
・語彙や文法、文脈把握の難しいスクリプトには詳しい解説を、簡単なスクリプトはシンプル（もしくは不要）な解説を心がけて下さい。
```

## 4. Deploy

- git add, commit
- npm version patch -m "feed data"
- git push
- git push --tags