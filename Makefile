# Makefile for running xelatex to generate PDF

# Variables
TEMPLATE_DIR := /home/report/report_template/repeng-json-schema-extraction-report
PDF_REPORT_DIR := /home/report/final_report

# Default target
all: report

# Target to build the PDF
report:
	@if [ ! -f $(TEMPLATE_DIR)/dynamicTable.tex ]; then \
		echo "Oops..Run the experiment at least once to generate a report. Run './doAll.sh'"; \
	else \
		echo "Building PDF ......."; \
		cp -r $(TEMPLATE_DIR)/* $(PDF_REPORT_DIR)/; \
		cd $(PDF_REPORT_DIR) && xelatex main.tex && bibtex main.aux && xelatex main.tex && xelatex main.tex; \
		chown -R moe:moe /home/report/; \
		echo "PDF created! You can find the generated PDF at 'home/report/final_report'"; \
	fi

# Clean target to remove generated files
clean:
	@if [ -n "$(wildcard $(PDF_REPORT_DIR)/*)" ]; then \
		echo "Cleaning up..."; \
		rm -rf $(PDF_REPORT_DIR)/*; \
		echo "Clean up done!"; \
	else \
		echo "No report to clean."; \
	fi

.PHONY: all report clean
