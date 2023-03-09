const fileInput = document.getElementById("markdown-file");
const convertButton = document.getElementById("convert-button");
const csvTableContainer = document.getElementById("csv-table-container");
const csvDownloadLink = document.getElementById("csv-download-link");

convertButton.addEventListener("click", () => {
	const file = fileInput.files[0];
	const reader = new FileReader(); // FileReader: https://developer.mozilla.org/ja/docs/Web/API/FileReader
	reader.onload = function () {
		// reader.onload: FileReaderがファイルの読み込み(`reader.readAsText(file)`)を完了したときに呼び出されるコールバック関数
		const markdownTable = reader.result;
		const rowPattern = /^\|(.+)\|$/; // 先頭が|で、末尾が|である1行の文字列 = 区切り線ではない行
		const separatorPattern = /^\|(-+)\|$/; // 先頭が|で、末尾が|である一つ以上の`-`を含む文字列 = 区切り線の行
		let isHeaderRow = true; // 処理中の行がmdテーブルのヘッダーかどうかを表す
		const tableData = [];
		const rows = markdownTable.split("\n");

		// test: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
		for (const row of rows) {
			if (separatorPattern.test(row)) {
				isHeaderRow = false;
				continue;
			}

			if (rowPattern.test(row)) {
				const rowData = row
					.trim() // " | aaa | bbb | ccc | ddd |  " => "| aaa | bbb | ccc | ddd |"
					.slice(1, -1) // "| aaa | bbb | ccc | ddd |" => " aaa | bbb | ccc | ddd "
					.split("|") // " aaa | bbb | ccc | ddd " => [' aaa ', ' bbb ', ' ccc ', ' ddd ']
					.map((cell) => cell.trim()); // [' aaa ', ' bbb ', ' ccc ', ' ddd '] => ['aaa', 'bbb', 'ccc', 'ddd']

				// 区切り行の場合
				if (isHeaderRow) {
					const headerData = rowData.map((cell) => ({
						value: cell,
						bold: true,
					}));
					tableData.push(headerData);
				} else {
					const dataRow = rowData.map((cell) => ({
						value: cell,
					}));
					tableData.push(dataRow);
				}
				isHeaderRow = false; // 最初の行を処理した後フラグをリセットする
			}
		}

		const csvData = tableData
			.map((row) => row.map((cell) => cell.value).join(","))
			.join("\n");

		const blob = new Blob([csvData], { type: "text/csv" }); // https://developer.mozilla.org/ja/docs/Web/API/Blob
		csvDownloadLink.href = URL.createObjectURL(blob); // https://developer.mozilla.org/ja/docs/Web/API/URL/createObjectURL
		csvDownloadLink.download = "table.csv";
		csvTableContainer.innerHTML = `<pre>${csvData}</pre>`;
	};
	reader.readAsText(file);
});