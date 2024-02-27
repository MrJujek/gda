import Picker from "emoji-picker-react";

interface Props {
	onEmojiClick: (emojiObject: { emoji: string }) => void;
}
export function EmojiPicker(props: Props) {
	return (
		<div className="absolute top-neg-450 left-0">
			<Picker onEmojiClick={props.onEmojiClick} />
		</div>
	);
}
