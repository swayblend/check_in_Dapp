const main = async () => {
  const certifiedContractFactory = await hre.ethers.getContractFactory(
    "Certification"
  );
  const certifiedContract = await certifiedContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await certifiedContract.deployed();
  console.log("Contract addy:", certifiedContract.address);

  /*
   * Get Contract balance
   */
  let contractBalance = await hre.ethers.provider.getBalance(
    certifiedContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  /*
   * Send Wave
   */

  //   let checkedInCount;
  //   checkedInCount = await certifiedContract.getTotalCheckIns();
  //   console.log(checkedInCount.toNumber());

  // let checkInTxn = await certifiedContract.checkIn("A message!");
  // await checkInTxn.wait();

  /*
   * Get Contract balance to see what happened!
   */

  /*
   * Let's try two waves now
   */
  const checkInTxn = await certifiedContract.checkIn("This is attendee #1");
  await checkInTxn.wait();

  const checkInTxn2 = await certifiedContract.checkIn("This is attendee #2");
  await checkInTxn2.wait();

  contractBalance = await hre.ethers.provider.getBalance(
    certifiedContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  //   const [_, randomPerson] = await hre.ethers.getSigners();
  //   checkInTxn = await certifiedContract
  //     .connect(randomPerson)
  //     .checkIn("Another message!");
  //   await checkInTxn.wait();

  let allCheckedIns = await certifiedContract.getAllCheckedIns();
  console.log(allCheckedIns);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
