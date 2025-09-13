import { randomInt } from "./functions"

const frustratedEmojis = ["🫠", "🙃", "🙁", "😞", "😔", "😟", "😕", "😩", "😫", "😣", "😭", "😢", "🥺", "😖", "😓", "😿", "😥", "🙄", "😤", "🤦", "😵", "☠️", "🥺", "😪", "🫤"]

export function randomEmoji(): string {
    return frustratedEmojis[randomInt(0, frustratedEmojis.length-1)]
}