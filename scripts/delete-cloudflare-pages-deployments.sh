for project_name in chapter-ip-admin-staging chapter-ip-frontend-staging; do
  prod_id=""
  echo "Cleaning deployments for $project_name..."

  while :; do
    ids=$(npx wrangler pages deployment list --project-name "$project_name" --json | jq -r '.[].Id')
    to_delete=$(echo "$ids" | grep -v -F -x "$prod_id" | grep .)
    [ -z "$to_delete" ] && { echo "Done. Production: $prod_id"; break; }
    deployment_count=$(echo "$to_delete" | wc -l | tr -d ' ')
    deployment_number=0
    echo "Deleting $deployment_count deployments..."
    while IFS= read -r id; do
      deployment_number=$((deployment_number + 1))
      echo "[$deployment_number/$deployment_count] Deleting $id..."
      if ! npx wrangler pages deployment delete "$id" --project-name "$project_name" --force 2>&1 | tee /tmp/wrangler-del.log | grep -q "Successfully deleted"; then
        if grep -q "active production deployment" /tmp/wrangler-del.log; then
          prod_id="$id"
          echo "Keeping active production deployment $id."
        else
          cat /tmp/wrangler-del.log >&2
          exit 1
        fi
      fi
    done <<< "$to_delete"
  done
done
