import mongoose from "mongoose";
import { IHomePage } from "../interfaces/homePage.interface";

const homePageSchema = new mongoose.Schema<IHomePage>(
  {
    courseCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    featuredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    testimonials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReviewAndRating",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const HomePage = mongoose.model<IHomePage>("HomePage", homePageSchema);

export default HomePage;
