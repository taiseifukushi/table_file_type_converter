const fileInput = document.getElementById("markdown-file");
const convertButton = document.getElementById("convert-button");
const csvTableContainer = document.getElementById("csv-table-container");
const csvDownloadLink = document.getElementById("csv-download-link");
const excelTableContainer = document.getElementById("excel-table-container");
const excelDownloadLink = document.getElementById("excel-download-link");

convertButton.addEventListener("click", () => {
	const file = fileInput.files[0];
	const reader = new FileReader();
	reader.onload = function () {
		const markdownTable = reader.result;
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
				const rowData = row.trim().slice(1, -1).split("|").map((cell) => cell.trim());
				const dataRow = rowData.map((cell) => ({
					value: cell,
				}));
				tableData.push(dataRow);
			}
		}

		const csvData = tableData
			.map((row) => row.map((cell) => cell.value).join(","))
			.join("\n");
		const csvBlob = new Blob([csvData], { type: "text/csv" });
		csvDownloadLink.href = URL.createObjectURL(csvBlob);
		csvDownloadLink.download = "table.csv";
    csvTableContainer.innerHTML =
				"The conversion to an CSV file is complete.";

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
	};
  reader.readAsText(file);
});

function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xff;
  }
  return buf;
}
