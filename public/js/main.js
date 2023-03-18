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
		processConvertFile: (file) => {},
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

// ファイル種別をチェックし、各ファイルへの変換処理をアップロードされてファイルによって分岐させる
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

// markdown
function markdownToOtherTable(markdownTable) {
	const data = tableData(markdownTable);
	markdownToCsv(data);
	markdownToExcel(data);
}

function tableData(markdownTable) {
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
