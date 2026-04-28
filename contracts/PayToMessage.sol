// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PayToMessage {
    struct Message {
        string id;
        address sender;
        address recipient;
        string content;
        uint256 payment;
        bool isRead;
        uint256 sentAt;
    }

    // Mapping from recipient address to their required message rate
    mapping(address => uint256) public messageRates;
    
    // Mapping from recipient address to their accumulated earnings
    mapping(address => uint256) public earnings;
    
    // Mapping from message ID to Message details
    mapping(string => Message) public messages;
    
    // Mapping from recipient address to an array of message IDs (their inbox)
    mapping(address => string[]) private inboxes;

    // Events
    event RateSet(address indexed user, uint256 rate);
    event MessageSent(string id, address indexed sender, address indexed recipient, uint256 payment);
    event MessageRead(string id, address indexed recipient);

    error ContentEmpty();
    error InsufficientPayment(uint256 provided, uint256 required);
    error MessageNotFound();
    error NotRecipient();

    /**
     * @dev Set the minimum payment required to send a message to the caller.
     * @param rate The minimum payment in wei (native token).
     */
    function setRate(uint256 rate) external {
        messageRates[msg.sender] = rate;
        emit RateSet(msg.sender, rate);
    }

    /**
     * @dev Send a message to a recipient, attaching the required payment.
     * @param id A unique identifier for the message.
     * @param recipient The address of the user receiving the message.
     * @param content The text content of the message.
     */
    function sendMessage(string memory id, address recipient, string memory content) external payable {
        if (bytes(content).length == 0) {
            revert ContentEmpty();
        }

        uint256 requiredRate = messageRates[recipient];
        if (msg.value < requiredRate) {
            revert InsufficientPayment(msg.value, requiredRate);
        }

        // Store the message
        messages[id] = Message({
            id: id,
            sender: msg.sender,
            recipient: recipient,
            content: content,
            payment: msg.value,
            isRead: false,
            sentAt: block.timestamp
        });

        // Add to recipient's inbox
        inboxes[recipient].push(id);

        // Update recipient's earnings
        earnings[recipient] += msg.value;

        emit MessageSent(id, msg.sender, recipient, msg.value);
    }

    /**
     * @dev Mark a message as read. Only the recipient can do this.
     * @param id The unique identifier for the message.
     */
    function readMessage(string memory id) external {
        Message storage msgData = messages[id];
        if (msgData.recipient == address(0)) {
            revert MessageNotFound();
        }
        if (msgData.recipient != msg.sender) {
            revert NotRecipient();
        }

        msgData.isRead = true;
        emit MessageRead(id, msg.sender);
    }

    /**
     * @dev Get a message by ID.
     * @param id The unique identifier for the message.
     */
    function getMessage(string memory id) external view returns (Message memory) {
        Message memory msgData = messages[id];
        if (msgData.recipient == address(0)) {
            revert MessageNotFound();
        }
        return msgData;
    }

    /**
     * @dev List all message IDs in the given recipient's inbox.
     * @param recipient The address to get the inbox for.
     */
    function listInbox(address recipient) external view returns (string[] memory) {
        return inboxes[recipient];
    }
}
