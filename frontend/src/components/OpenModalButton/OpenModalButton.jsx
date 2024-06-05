import { useModal } from "../../context/Modal";

function OpenModalButton({
    modalComponent, buttonText, onButtonClick,onModalClose
}){
    const {setModalContent, setOnModalClose} = useModal();

    const onClick = () => {
        if(onModalClose) setOnModalClose(onModalClose);
        setModalContent(modalComponent);
        if(typeof onButtonClick === 'function')
            onButtonClick();
    };
    const Greeting = () => {
        return (
            <OpenModalButton
                buttonText="Greeting"
                modalComponent={<h2>Hello World!</h2>}
                onButtonClick={() => console.log("Greeting initiated")}
                onModalClose={() => console.log("Greeting completed")}
            />
        );
    };
    return <button onClick={onClick}>{buttonText}</button>
}

export default OpenModalButton;