import ticket from "@/assets/ticket/ticket.png?base64";
import n02088364_2158 from "@/assets/problems/n02088364_2158.jpg?base64";
import n02088364_2160 from "@/assets/problems/n02088364_2160.jpg?base64";
import n02105641_1945 from "@/assets/problems/n02105641_1945.jpg?base64";
import n02105641_4815 from "@/assets/problems/n02105641_4815.jpg?base64";
import n02930766_4316 from "@/assets/problems/n02930766_4316.jpg?base64";
import n02992529_12912 from "@/assets/problems/n02992529_12912.jpg?base64";
import n03642806_8178 from "@/assets/problems/n03642806_8178.jpg?base64";
import n03775071_300 from "@/assets/problems/n03775071_300.jpg?base64";
import n07873807_1001 from "@/assets/problems/n07873807_1001.jpg?base64";

export class MockImageLoader {
  private readonly MockTicketImage = ticket;
  private readonly MockProblemImages = [
    { id: "n02088364_2158", image: n02088364_2158 },
    { id: "n02088364_2160", image: n02088364_2160 },
    { id: "n02105641_1945", image: n02105641_1945 },
    { id: "n02105641_4815", image: n02105641_4815 },
    { id: "n02930766_4316", image: n02930766_4316 },
    { id: "n02992529_12912", image: n02992529_12912 },
    { id: "n03642806_8178", image: n03642806_8178 },
    { id: "n03775071_300", image: n03775071_300 },
    { id: "n07873807_1001", image: n07873807_1001 },
  ];

  ticket(): string {
    return this.MockTicketImage;
  }

  problemImages() {
    return shuffle(this.MockProblemImages).map((img) => ({
      id: img.id,
      image: img.image,
    }));
  }
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
