
async function main() {
	// // list all accounts
	const accounts = await ethers.provider.listAccounts();
	console.log(accounts);	

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
