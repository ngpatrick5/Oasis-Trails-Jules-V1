const GameDataManager = {
    
    profile: {
        challengeCompletions: {},
        equipment: {
            head: null, chest: null, legs: null, main_hand: null, 
            off_hand: null, boots: null, gloves: null, necklace: null, 
            ring1: null, ring2: null
        },
        inventory: Array(48).fill(null),
        unlockedPrayers: ["range", "magic", "melee"]
    },

    loadProfile: function() {
        const savedDataString = localStorage.getItem('pixelAdventureProfile');
        const defaultProfile = {
            challengeCompletions: {},
            equipment: { head: null, chest: null, legs: null, main_hand: null, off_hand: null, boots: null, gloves: null, necklace: null, ring1: null, ring2: null },
            inventory: Array(48).fill(null),
            unlockedPrayers: ["range", "magic", "melee"]
        };
        if (savedDataString) {
            const savedProfile = JSON.parse(savedDataString);
            this.profile = Object.assign({}, defaultProfile, savedProfile);
        } else {
            this.profile = defaultProfile;
        }
    },

    saveProfile: function() {
        const jsonString = JSON.stringify(this.profile);
        localStorage.setItem('pixelAdventureProfile', jsonString);
        console.log("Profile Saved!", this.profile);
    },
    
    resetProfile: function() {
        localStorage.removeItem('pixelAdventureProfile');
        this.loadProfile(); 
        console.log("Profile has been reset!");
    },

    addItemToInventory(itemId, quantity = 1) {
        const emptySlotIndex = this.profile.inventory.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            this.profile.inventory[emptySlotIndex] = { itemId: itemId, quantity: quantity };
            this.saveProfile();
            return true;
        }
        return false;
    },

    /**
     * Equips an item from a specific inventory slot. Handles swapping.
     * @param {number} inventoryIndex - The index in the inventory array of the item to equip.
     * @param {object} itemDatabase - A reference to the loaded items.json.
     */
    equipItem(inventoryIndex, itemDatabase) {
        const itemToEquip = this.profile.inventory[inventoryIndex];
        if (!itemToEquip) return;

        const itemData = itemDatabase[itemToEquip.itemId];
        const targetSlot = itemData.equipSlot;
        if (!targetSlot) return;

        // --- THIS IS THE CORRECTED SWAP LOGIC ---
        // 1. Get the ID of the item currently in the equipment slot (could be null).
        const currentlyEquippedItemId = this.profile.equipment[targetSlot];

        // 2. Place the new item's ID into the equipment slot.
        this.profile.equipment[targetSlot] = itemToEquip.itemId;

        // 3. Check if there was an item equipped before.
        if (currentlyEquippedItemId) {
            // If yes, put the OLD item back into the inventory slot the new one came from.
            this.profile.inventory[inventoryIndex] = { itemId: currentlyEquippedItemId, quantity: 1 };
        } else {
            // If the slot was empty, the inventory slot is now empty.
            this.profile.inventory[inventoryIndex] = null;
        }
        
        this.saveProfile();
    },

    /**
     * Unequips an item from a specific equipment slot.
     * @param {string} slotName - The name of the equipment slot (e.g., 'head', 'main_hand').
     * @returns {boolean} - True if successful, false if inventory is full.
     */
    unequipItem(slotName) {
        const itemToUnequipId = this.profile.equipment[slotName];
        if (!itemToUnequipId) return true;
        
        // Try to add the unequipped item back to the inventory.
        const wasAdded = this.addItemToInventory(itemToUnequipId, 1);
        if (wasAdded) {
            // IMPORTANT: Only clear the equipment slot if the item was successfully moved.
            this.profile.equipment[slotName] = null;
            this.saveProfile();
            return true;
        }
        
        console.log("Cannot unequip, inventory is full.");
        return false;
    },

    calculateTotalStats(itemDatabase) {
        const totalStats = {};
        for (const slot in this.profile.equipment) {
            const itemId = this.profile.equipment[slot];
            if (itemId) {
                const itemData = itemDatabase[itemId];
                if (itemData && itemData.stats) {
                    for (const stat in itemData.stats) {
                        totalStats[stat] = (totalStats[stat] || 0) + itemData.stats[stat];
                    }
                }
            }
        }
        return totalStats;
    }
};