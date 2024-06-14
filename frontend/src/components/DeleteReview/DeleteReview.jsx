import { useDispatch } from "react-redux";
import{useModal} from '../../context/Modal';
import { deleteSingleReview } from "../../store/spots";
import './DeleteReview.css';

const DeleteReview = ({reviewId}) => {
    const dispatch = useDispatch();
    const {closeModal} = useModal();

    const handleDelete = () => {
        dispatch(deleteSingleReview(reviewId))
        .then(()=> {
            closeModal();
        })
    }
    const handleCancel= () => {
        closeModal();
    }

    return (
        <form>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this review?</p>
            <button onClick={(handleDelete)} className='delete-yes'>Yes (Delete Review)</button>
            <button onClick={handleCancel} className='delete-No'>No (Keep Review)</button>
        </form>
    )
};

export default DeleteReview;