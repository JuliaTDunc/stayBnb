import { useDispatch } from "react-redux";
import {useModal} from '../../context/Modal';
import {deleteSingleSpot} from '../../store/spots';
import './DeleteSpot.css';

const DeleteSpot = ({spotId}) => {
    const dispatch = useDispatch();
    const {closeModal} = useModal();

    const handleDelete = () => {
        dispatch(deleteSingleSpot(spotId))
        .then(()=> {
            closeModal();
        })
    }
    const handleCancel = () => {
        closeModal();
    }
    return (
        <form>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to remove this spot?</p>
            <button onClick={handleDelete} className='spot-delete-yes'>Yes (Delete Spot)</button>
            <button onClick={handleCancel} className='spot-delete-no'>No (Keep Spot)</button>
        </form>
    )
};

export default DeleteSpot;