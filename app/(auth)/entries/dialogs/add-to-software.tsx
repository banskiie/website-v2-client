"use client";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ENTRY = gql`
  query Entry($_id: ID!) {
    entry(_id: $_id) {
      entryNumber
    }
  }
`;

const CHANGE_IN_SOFTWARE_STATUS = gql`
  mutation ChangeInSoftwareStatus($_id: ID!) {
    changeInSoftwareStatus(_id: $_id) {
      ok
      message
    }
  }
`;

type Props = {
  _id?: string;
  onClose?: () => void;
  isInSoftware?: boolean;
};

const SoftwareStatusDialog = (props: Props) => {
  // Dialog open state
  const [open, setOpen] = useState(false);
  // Fetch existing date if updating
  const { data, loading: eventLoading }: any = useQuery(ENTRY, {
    variables: { _id: props._id },
    skip: !open || !Boolean(props._id),
    fetchPolicy: "network-only",
  });
  // Mutation for changing status
  const [changeStatus, { loading: changeStatusLoading }] = useMutation(
    CHANGE_IN_SOFTWARE_STATUS,
    {
      variables: { _id: props._id },
    },
  );
  // Loading State
  const loading = eventLoading || changeStatusLoading;

  const onSubmit = async () => {
    try {
      const result: any = await changeStatus();
      if (result) onClose();
    } catch (error: any) {
      console.error("Error changing in software status:", error);
      toast.error(error.message || "Failed to change in software status.");
    }
  };

  const onClose = () => {
    setOpen(false);
    props.onClose?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <form>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem
            className={cn(
              !props?.isInSoftware ? "text-success" : "text-destructive ",
            )}
            onSelect={(e) => e.preventDefault()}
          >
            {!props?.isInSoftware ? "Add to Software" : "Remove from Software"}
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {!props?.isInSoftware ? "Add to Software" : "Remove from Software"} Entry:{" "}
              {data?.entry?.entryNumber}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground">
                Are you sure you want to{" "}
                <span
                  className={cn(
                    !props?.isInSoftware ? "text-success" : "text-destructive",
                    "font-semibold underline",
                  )}
                >
                  {!props?.isInSoftware ? "add" : "remove"}
                </span>{" "} 
                this entry to software?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={loading}
              onClick={onSubmit}
              variant={!props?.isInSoftware ? "success" : "destructive"}
              className={cn(!props?.isInSoftware ? "w-20" : "w-26")}
            >
              {!props?.isInSoftware ? "Add" : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  );
};

export default SoftwareStatusDialog;
