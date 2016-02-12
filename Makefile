test:
    @node node_modules/lab/bin/lab -a code --lint
test-cov: 
    @node node_modules/lab/bin/lab -a code -t 80 --lint
test-cov-html:
    @node node_modules/lab/bin/lab -a code -r html -o coverage.html --lint

.PHONY: test test-cov test-cov-html
