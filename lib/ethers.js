import { ethers } from "ethers";
import PayToMessageArtifact from "./PayToMessage.json";

export const CONTRACT_ADDRESS = "0xEDECE0d3faAAC7ffE47C8F9A85d33970676BF958"; // Deployed address on Nero Chain

let provider;
let signer;
let contract;

const getProvider = async () => {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    if (!provider) {
        provider = new ethers.BrowserProvider(window.ethereum);
    }
    return provider;
};

const getContract = async (withSigner = false) => {
    const p = await getProvider();
    if (withSigner) {
        if (!signer) {
            signer = await p.getSigner();
        }
        return new ethers.Contract(CONTRACT_ADDRESS, PayToMessageArtifact.abi, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, PayToMessageArtifact.abi, p);
};

export const checkConnection = async () => {
    try {
        if (!window.ethereum) return null;
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
            return { publicKey: accounts[0] };
        }
        
        // If not connected, we can prompt, but typically checkConnection shouldn't force prompt
        return null;
    } catch {
        return null;
    }
};

export const connectWallet = async () => {
    try {
        if (!window.ethereum) throw new Error("MetaMask is not installed");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        signer = await (await getProvider()).getSigner();
        return { publicKey: accounts[0] };
    } catch (err) {
        throw err;
    }
}

export const setRate = async (recipient, ratePerMessage) => {
    if (!recipient) throw new Error("recipient address is required");
    const contract = await getContract(true);
    const tx = await contract.setRate(ratePerMessage.toString());
    return await tx.wait();
};

export const sendMessage = async (payload) => {
    if (!payload?.id) throw new Error("id is required");
    if (!payload?.recipient) throw new Error("recipient address is required");
    
    const contract = await getContract(true);
    const tx = await contract.sendMessage(
        payload.id,
        payload.recipient,
        payload.content || "",
        { value: payload.paymentAmount.toString() }
    );
    return await tx.wait();
};

export const readMessage = async (id, recipient) => {
    if (!id) throw new Error("id is required");
    const contract = await getContract(true);
    const tx = await contract.readMessage(id);
    return await tx.wait();
};

export const getMessage = async (id) => {
    if (!id) throw new Error("id is required");
    const contract = await getContract(false);
    const msg = await contract.getMessage(id);
    return {
        id: msg.id,
        sender: msg.sender,
        recipient: msg.recipient,
        content: msg.content,
        payment: msg.payment.toString(),
        isRead: msg.isRead,
        sentAt: msg.sentAt.toString()
    };
};

export const listInbox = async (recipient) => {
    if (!recipient) throw new Error("recipient address is required");
    const contract = await getContract(false);
    const inboxes = await contract.listInbox(recipient);
    // returns an array of strings (IDs)
    return Array.from(inboxes);
};

export const getRate = async (recipient) => {
    if (!recipient) throw new Error("recipient address is required");
    const contract = await getContract(false);
    const rate = await contract.messageRates(recipient);
    return rate.toString();
};

export const getEarnings = async (recipient) => {
    if (!recipient) throw new Error("recipient address is required");
    const contract = await getContract(false);
    const earnings = await contract.earnings(recipient);
    return earnings.toString();
};
