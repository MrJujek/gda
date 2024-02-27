import Picker from "emoji-picker-react";

interface Props {
	onEmojiClick: (emojiObject: { emoji: string }) => void;
}
export function EmojiPicker(props: Props) {
	return (
		<div id="lego" className="absolute mb-2 left-0 top-0">
			<Picker onEmojiClick={props.onEmojiClick} />
		</div>
	);
}
