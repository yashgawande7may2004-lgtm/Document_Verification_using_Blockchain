const contractAddress = "0x5Babc51194F8d309176Bc043cf47F92e54742ceA";

const contractABI = [
  
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "hash",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "DocumentStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			}
		],
		"name": "storeHash",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			}
		],
		"name": "verifyHash",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

];

async function storeHashOnBlockchain(hash) {
  if (!window.ethereum) {
    alert("MetaMask not installed");
    return;
  }

  // Request account access
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  // MetaMask confirmation will pop up here
  const tx = await contract.storeHash(hash);
  await tx.wait();

  alert("✅ Hash stored on blockchain successfully!");
}
// ... existing code (contractAddress, contractABI, storeHashOnBlockchain) ...

// Adapted from your readHash.js for the Browser
async function verifyHashOnBlockchain(hash) {
  try {
    // 1. Check for MetaMask
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return false;
    }

    // 2. Use BrowserProvider (connects to your MetaMask wallet)
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // 3. Create Contract Instance (Read-only connection is fine for verification)
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // 4. Call the verifyHash function (matches ABI in readHash.js)
    console.log("Verifying hash on blockchain:", hash);
    const isValid = await contract.verifyHash(hash);
    
    console.log("Is Valid?", isValid);
    return isValid;

  } catch (error) {
    console.error("Error verifying hash:", error);
    alert("Check console for error details");
    return false;
  }
}