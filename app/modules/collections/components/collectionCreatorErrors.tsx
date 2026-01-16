
const CollectionCreatorErrors = ({
  errors
}: {
  errors: Record<string, string>;
}) => {
  return (
    <div>
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2">Errors</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CollectionCreatorErrors;
