import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";

function AddCard({ setshowCardList }) {
  return (
    <div className="addListForm addListCard">
      <form action="">
        <input type="text" name="" id="" placeholder="Enter list title…" />
        <div>
          <Button variant="primary">Add card</Button>
          <CloseButton onClick={() => setshowCardList(false)} />
        </div>
      </form>
    </div>
  );
}

export default AddCard;
