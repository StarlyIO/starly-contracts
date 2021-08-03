.PHONY: test
test:
	$(MAKE) test -C contracts
	$(MAKE) test -C test

.PHONY: generate
generate:
	$(MAKE) generate -C contracts
	$(MAKE) generate -C scripts
	$(MAKE) generate -C transactions

.PHONY: ci
ci:
	$(MAKE) ci -C contracts
	$(MAKE) ci -C scripts
	$(MAKE) ci -C transactions
	$(MAKE) ci -C test
