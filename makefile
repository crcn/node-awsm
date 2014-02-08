ALL_TESTS = $(shell find ./test -name "*-test.js")

test-node:
	./node_modules/.bin/_mocha $(ALL_TESTS) --timeout 9999999 --ignore-leaks --bail

test-cov:
	CACHE=1 NODE_ENV=TEST_COV \
	./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha $(ALL_TESTS) --ignore-leaks
