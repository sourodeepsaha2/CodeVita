import Spinner from "../ui/Spinner";

export default function SubmitButton({ id, loading = false, loadingText, disabled = false, children }) {
  return (
    <button
      id={id}
      type="submit"
      className="btn-primary-cv btn-lg btn-block"
      disabled={loading || disabled}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
