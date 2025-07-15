import mongoose from "mongoose";

const mtgCardSchema = new mongoose.Schema({
    identifiers: [Object]
});

const Card = mongoose.models.MtgCard || mongoose.model("MtgCard", mtgCardSchema);

export default Card;