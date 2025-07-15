import mongoose from "mongoose";

const mtgCardSchema = new mongoose.Schema({
    id : {
        type: String,
        required: true,
        unique: false
    },
});

const Card = mongoose.models.MtgCard || mongoose.model("MtgCard", mtgCardSchema);

export default Card;