const fileInput = document.getElementById("upload-file");
const convertButton = document.getElementById("convert-button");
const csvTableContainer = document.getElementById("csv-table-container");
const csvDownloadLink = document.getElementById("csv-download-link");
const excelTableContainer = document.getElementById("excel-table-container");
const excelDownloadLink = document.getElementById("excel-download-link");
const markdownTableContainer = document.getElementById("markdown-table-container");
const markdownDownloadLink = document.getElementById("markdown-download-link");
const fileTypes = {
	md: {
		processConvertFile: (file) => {
			markdownToOtherTable(file);
		},
	},
	csv: {
		processConvertFile: (file) => {
			csvToOtherTable(file);
		},
	},
	xls: {
		processConvertFile: (file) => {},
	},
	xlsx: {
		processConvertFile: (file) => {},
	},
};

convertButton.addEventListener("click", () => {
	const file = fileInput.files[0];
	const reader = new FileReader();
	reader.onload = () => {
		const inputTableData = reader.result;
		const fileType = getUploadedFileExtension(file.name);
		fileType.processConvertFile(inputTableData);
		;
	}
  reader.readAsText(file);
});

// ##########################
// ファイル種別をチェックし、各ファイルへの変換処理をアップロードされてファイルによって分岐させる
// ##########################
function getUploadedFileExtension(filename) {
  const extension = filename.split(".").pop().toLowerCase();
  return (
		fileTypes[extension] || {
			processFile: () => { 
				const massage = "Unknown file type.";
				alert(massage);
				console.error(massage);
			}
		}
  );
}

// ##########################
// 変換後のファイルをHTMLに挿入する
// ##########################


// ########################## markdown ##########################
function markdownToOtherTable(markdownTable) {
	const data = tableDataForMarkdown(markdownTable);
	markdownToCsv(data);
	markdownToExcel(data);
}

function tableDataForMarkdown(markdownTable) {
	const rowPattern = new RegExp(/^\|(\s*[\w\s]+\s*\|)+$/);
	const separatorPattern = new RegExp(/^\|(\s*[-:]+\s*\|)+$/);
	const tableData = [];
	const rows = markdownTable.split("\n");

	for (const row of rows) {
		if (separatorPattern.test(row)) {
			console.log("separatorPattern", row);
			continue;
		}

		if (rowPattern.test(row)) {
			console.log("rowPattern", row);
			const rowData = row
				.trim()
				.slice(1, -1)
				.split("|")
				.map((cell) => cell.trim());
			const dataRow = rowData.map((cell) => ({
				value: cell,
			}));
			tableData.push(dataRow);
		}
	}
	return tableData;
}

function markdownToCsv(tableData) {
	const csvData = tableData
		.map((row) => row.map((cell) => cell.value).join(","))
		.join("\n");
	const csvBlob = new Blob([csvData], { type: "text/csv" });
	csvDownloadLink.href = URL.createObjectURL(csvBlob);
	csvDownloadLink.download = "table.csv";
	csvTableContainer.innerHTML = "The conversion to an CSV file is complete.";
}

function markdownToExcel(tableData) {
	const workbook = XLSX.utils.book_new();
	const worksheet = XLSX.utils.aoa_to_sheet(
		tableData.map((row) => row.map((cell) => cell.value))
	);
	XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
	const excelBlob = new Blob(
		[
			s2ab(
				XLSX.write(workbook, {
					type: "binary",
				})
			),
		],
		{
			type: "application/octet-stream",
		}
	);
	excelDownloadLink.href = URL.createObjectURL(excelBlob);
	excelDownloadLink.download = "table.xlsx";
	excelTableContainer.innerHTML =
		"The conversion to an Excel file is complete.";
}

function s2ab(s) {
	const buf = new ArrayBuffer(s.length);
	const view = new Uint8Array(buf);
	for (let i = 0; i !== s.length; ++i) {
		view[i] = s.charCodeAt(i) & 0xff;
	}
	return buf;
}

// ########################## csv ##########################
function csvToOtherTable(csvTable) {
	csvToExcel(csvTable);
	csvToMarkdown(csvTable);
}

function csvToExcel(tableData) {
	// const worksheet = XLSX.utils.csv_to_sheet(tableData);
	const data = Papa.parse(tableData).data;
	const workbook = XLSX.utils.book_new();
	const worksheet = XLSX.utils.sheet_add_aoa(
		XLSX.utils.book_new().SheetNames,
		data
	);
	XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
	const excelBlob = new Blob(
		[
			s2ab(
				XLSX.write(workbook, {
					type: "binary",
				})
			),
		],
		{
			type: "application/octet-stream",
		}
	);
	excelDownloadLink.href = URL.createObjectURL(excelBlob);
	excelDownloadLink.download = "table.xlsx";
	excelTableContainer.innerHTML =
		"The conversion to an Excel file is complete.";
}

function csvToMarkdown(tableData) {
	const data = tableData.split("\n").map((row) => row.split(","));
	const markdownRows = data.map((row) => `|${row.join("|")}|`).join("\n");
	const markDownBlob = new Blob([markdownRows], { type: "text/markdown" });
	markdownDownloadLink.href = URL.createObjectURL(markDownBlob);
	markdownDownloadLink.download = "table.md";
	markdownTableContainer.innerHTML =
		"The conversion to an Markdown file is complete.";
}
