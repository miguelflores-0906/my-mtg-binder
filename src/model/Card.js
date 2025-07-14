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

    imageUrl: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const Card = mongoose.models.MtgCard || mongoose.model("MtgCard", mtgCardSchema);

export default Card;