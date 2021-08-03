module github.com/onflow/flow-ft/lib/go/test

go 1.16

require (
	github.com/StarlyIO/starly-contracts/lib/go/contracts v0.5.0
	github.com/StarlyIO/starly-contracts/lib/go/scripts v0.0.0-00010101000000-000000000000
	github.com/StarlyIO/starly-contracts/lib/go/transactions v0.0.0-00010101000000-000000000000
	github.com/onflow/cadence v0.18.0
	github.com/onflow/flow-emulator v0.22.0
	github.com/onflow/flow-go-sdk v0.21.0
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/stretchr/testify v1.7.0
)

replace github.com/StarlyIO/starly-contracts/lib/go/contracts => ../contracts
replace github.com/StarlyIO/starly-contracts/lib/go/scripts => ../scripts
replace github.com/StarlyIO/starly-contracts/lib/go/transactions => ../transactions
