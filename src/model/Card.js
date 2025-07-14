import mongoose from "mongoose";

const mtgCardSchema = new mongoose.Schema({

    scryfallId: {
        type: String,
        required: true,
        unique: false,
        index: true,
    },

    name: {
        type: String,
        required: true,
        unique: false,
        index: true,
    },

    set_code: {
        type: String,
        required: true,
        unique: false,
        index: true,
    },

    collector_number: {
        type: String,
        required: true,
        unique: false,
        index: true,
    },
});

const Card = mongoose.models.MtgCard || mongoose.model("MtgCard", mtgCardSchema);

export default Card;