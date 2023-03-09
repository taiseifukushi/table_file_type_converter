const fileInput = document.getElementById("markdown-file");
const convertButton = document.getElementById("convert-button");
const csvTableContainer = document.getElementById("csv-table-container");
const csvDownloadLink = document.getElementById("csv-download-link");
const excelTableContainer = document.getElementById("excel-table-container");
const excelDownloadLink = document.getElementById("excel-download-link");

convertButton.addEventListener("click", () => {
	const file = fileInput.files[0];
	const reader = new FileReader(); // FileReader: https://developer.mozilla.org/ja/docs/Web/API/FileReader
	reader.onload = function () {
		const markdownTable = reader.result; // reader.onload: FileReaderがファイルの読み込み(`reader.readAsText(file)`)を完了したときに呼び出されるコールバック関数
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

		// CSVファイルの作成
		const csvData = tableData
			.map((row) => row.map((cell) => cell.value).join(","))
			.join("\n");
		const csvBlob = new Blob([csvData], { type: "text/csv" }); // https://developer.mozilla.org/ja/docs/Web/API/Blob
		csvDownloadLink.href = URL.createObjectURL(csvBlob); // https://developer.mozilla.org/ja/docs/Web/API/URL/createObjectURL
		csvDownloadLink.download = "table.csv";
    csvTableContainer.innerHTML =
				"The conversion to an CSV file is complete.";

		// Excelファイルの作成
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.aoa_to_sheet(
			tableData.map((row) => row.map((cell) => cell.value))
		);
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
		const excelBlob = new Blob(
			[
				s2ab(
					XLSX.write(workbook, {
						type: "binary", // 出力をバイナリデータにする
					})
				),
			],
			{
				type: "application/octet-stream", // ExcelファイルのMIMEタイプ
			}
		);
		excelDownloadLink.href = URL.createObjectURL(excelBlob);
		excelDownloadLink.download = "table.xlsx";
		excelTableContainer.innerHTML =
			"The conversion to an Excel file is complete.";
	};
  reader.readAsText(file);
});

// 文字列をバイナリデータに変換する
// https://github.com/SheetJS/sheetjs/blob/master/dist/xlsx.full.min.js#L9
// https://qiita.com/tomgoodsun/items/0107e5d778b803935fc0
// https://docs.sheetjs.com/docs/demos/local/file#binary-data
// https://docs.sheetjs.com/docs/api/parse-options#guessing-file-type
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}
